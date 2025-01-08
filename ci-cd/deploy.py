#!/usr/bin/env python3

import os
import json
import subprocess
import argparse
from google.cloud import storage
from dataclasses import dataclass, field

@dataclass
class CliArgs:
  bucket_name: str = ""
  gc_project_id: str = ""
  is_github_actions: bool = False
  region: str = "europe-west1"
  create_cluster: bool = False
  repository: str = ""
  git_tag: str = ""
  identity_api_key: str = ""
  identity_auth_domain: str = ""
  domain_name: str = "park-app.tech"


def parse_args() -> CliArgs:
  parser = argparse.ArgumentParser(description="Sync tenants with Terraform and Helm.")
  parser.add_argument(
      "--region",
      default="europe-west1",
      help="Region for the cluster (default: europe-west1)."
  )
  parser.add_argument(
      "--project-id",
      required=True,
      help="Project ID to use in Terraform."
  )
  parser.add_argument(
      "--gcs-bucket",
      required=True,
      help="Name of the GCS bucket containing tenants.json"
  )
  # New arguments for extra Terraform variables
  parser.add_argument(
      "--is-github-actions",
      action="store_true",
      default=False,
      help="If set, is_github_actions is passed as true. Defaults to false."
  )
  parser.add_argument(
      "--create-cluster",
      action="store_true",
      default=False,
      help="If set, create_cluster is passed as true. Defaults to false."
  )
  parser.add_argument(
      "--repository",
      help="Repository URL for the frontend and backend."
  )
  parser.add_argument(
      "--git-tag",
      help="Git tag for the frontend and backend."
  )
  parser.add_argument(
      "--identity-api-key",
      help="API key for the identity platform."
  )
  parser.add_argument(
      "--identity-auth-domain",
      help="Auth domain for the identity platform."
  )
  parser.add_argument(
      "--domain-name",
      default="park-app.tech",
      help="Domain name used by Terraform (default: park-app.tech)."
  )

  args = parser.parse_args()

  return CliArgs(
    bucket_name=args.gcs_bucket,
    gc_project_id=args.project_id,
    is_github_actions=args.is_github_actions,
    region=args.region,
    create_cluster=args.create_cluster,
    repository=args.repository,
    git_tag=args.git_tag,
    identity_api_key=args.identity_api_key,
    identity_auth_domain=args.identity_auth_domain,
    domain_name=args.domain_name
  )
    

def create_tenant_namespace_name(tenant_id: str):
   return f"tenant-{tenant_id}-ns"

def create_tenant_release_name(service_name: str, tenant_id: str):
   return f"park-tenant-{tenant_id}-{service_name}"

# ------------------------------------------------------------------------------
# 1. Read tenants.json from GCS
# ------------------------------------------------------------------------------
def read_tenants_from_gcs(bucket_name: str, file_name: str = "tenants.json"):
    """
    Reads the specified JSON file from a Google Cloud Storage bucket and returns
    it as a list of tenant objects:
      [
        {
          "tenantId": "...",
          "dns": "..."
        },
        ...
      ]

    Returns an empty list if the file does not exist.
    """
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(file_name)

    # Check if the file exists in the bucket
    if not blob.exists():
        return []

    data = blob.download_as_text(encoding="utf-8")
    tenants = json.loads(data)
    return tenants


# ------------------------------------------------------------------------------
# 2. Generate a .tfvars.json file from the tenant list
# ------------------------------------------------------------------------------
def generate_tfvars_json(
    tenants,
    output_file: str,
    cliArgs: CliArgs
):
    """
    Creates a JSON file that Terraform can use for variables, e.g.:
      {
        "tenants": [
          { "id": "free", "domain": "free" },
          { "id": "premium", "domain": "premium" }
        ],
        "is_github_actions": true,
        "region": "europe-west1",
        "project_id": "my-project-id",
        "domain_name": "my-domain.com",
        "create_cluster": true
      }
    """
    variable_entries = []
    for t in tenants:
        variable_entries.append({
            "id": t["tenantId"],
            "domain": t["dns"]
        })

    # Build the data we'll write to tenants.tfvars.json
    tfvars_data = {
        "tenants": variable_entries,
        "is_github_actions": cliArgs.is_github_actions,
        "region": cliArgs.region,
        "project_id": cliArgs.gc_project_id,
        "domain_name": cliArgs.domain_name,
        "create_cluster": cliArgs.create_cluster
    }

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(tfvars_data, f, indent=2)

    print(f"Terraform tfvars JSON file written to: {output_file}")


# ------------------------------------------------------------------------------
# 3. Run terraform plan
# ------------------------------------------------------------------------------
def run_terraform_plan(tfvars_file="tenants.tfvars.json"):
    """
    Runs `terraform plan -var-file=...` in the current working directory. Prints stdout/stderr.
    """
    print("Running terraform init...")
    proc = subprocess.run(
        ["terraform", "init"],
        check=True,
        capture_output=True,
        text=True,
        cwd="./terraform/staging"
    )
    print(proc.stdout)

    print("Running 'terraform plan'...")
    proc = subprocess.run(
        ["terraform", "plan", f"-var-file={tfvars_file}"],
        check=True,
        capture_output=True,
        text=True,
        cwd="./terraform/staging"
    )
    print(proc.stdout)
    if proc.stderr:
        print(proc.stderr)


# ------------------------------------------------------------------------------
# 4. Run terraform apply
# ------------------------------------------------------------------------------
def run_terraform_apply(tfvars_file="tenants.tfvars.json"):
    """
    Runs `terraform apply -var-file=... -auto-approve` in the current directory.
    Prints stdout/stderr.
    """
    print("Running 'terraform apply'...")
    proc = subprocess.run(
        ["terraform", "apply", f"-var-file={tfvars_file}", "-auto-approve"],
        check=True,
        capture_output=True,
        text=True,
        cwd="./terraform/staging"
    )
    print(proc.stdout)
    if proc.stderr:
        print(proc.stderr)


# ------------------------------------------------------------------------------
# 5. Sync Kubernetes deployments (Helm releases) with tenants list
# ------------------------------------------------------------------------------
def sync_k8s_deployments_with_tenants(tenants, cliArgs: CliArgs):
  """
  Ensures each tenant has exactly one Helm release, named after tenantId. Any
  existing release not in the tenants list is removed.
  
  - We search across *all* namespaces for existing Helm releases.
  - We assume each tenant's Helm release name = tenantId
  - New releases are installed into the namespace: "<tenantId>-ns"
  - The --create-namespace flag is used to create these namespaces automatically
  - If a release doesn't match a tenant, we uninstall it.

  Aborts if the `create_cluster` flag is not set.
  """

  if not cliArgs.create_cluster:
    return
  
  # Deploy the infrastructure chart
  print("Deploying infrastructure chart...")
  subprocess.run(
    [
      "helm", "upgrade", "--install" , "park-infra", "./helm/infrastructure",
      "-n", "infra-ns",
      "--create-namespace",
      "--set", f"repository={cliArgs.repository}",
      "--set", f"gitTag={cliArgs.git_tag}",
      "--set", f"identityPlatForm.apiKey={cliArgs.identity_api_key}",
      "--set", f"identityPlatForm.authDomain={cliArgs.identity_auth_domain}",
      "--set", f"gc_project_id={cliArgs.gc_project_id}",
      "--set", f"domain={cliArgs.domain_name}",
    ],
    check=True
  )

  annotation_key = "shared-gateway-access"
  annotation_value = "true"
  subprocess.run(
    [
      "kubectl", "annotate",
      "namespace", "infra-ns",
      f"{annotation_key}='{annotation_value}'",
      "--overwrite"
    ],
    check=True
  )
  
  # Convert the list of tenantIds for easy lookups
  tenant_ids = {t["tenantId"]  for t in tenants}
  tenant_namespaces = [ create_tenant_namespace_name(t["tenantId"]) for t in tenants]

  print("Listing existing Helm releases in all namespaces...")
  helm_list_proc = subprocess.run(
    ["helm", "list", "--all-namespaces", "-o", "json"],
    capture_output=True,
    text=True,
    check=True
  )
  existing_releases = json.loads(helm_list_proc.stdout)

  existing_release_namespaces = []
  for release_info in existing_releases:
    release_name = release_info["name"]
    release_ns = release_info["namespace"]
    if release_name.startswith("park-backend-") or release_name.startswith("park-frontend-"):
      existing_release_namespaces.append(release_ns)

  # Uninstall releases that are no longer in the tenants list
  for release_ns in existing_release_namespaces:
    if release_name not in tenant_ids:
      print(f"Release '{release_name}' in namespace '{release_ns}' "
            f"no longer has a matching tenant. Uninstalling...")
      subprocess.run(
        ["kubectl", "delete", "namespace", release_ns],
        check=True
      )

  # Install new releases for newly-added tenants
  for tenant in tenants:
    tenant_id = tenant["tenantId"]
    tenant_dns = tenant["dns"]
    tenant_namespace = f"tenant-{tenant_id}-ns"
    print(f"Tenant '{tenant_id}' not deployed. Installing backend in namespace '{tenant_namespace}'...")
    subprocess.run(
      [
        "helm", "upgrade", "--install", f"park-backend-{tenant_id}", "./helm/backend",
        "-n", tenant_namespace,
        "--create-namespace",
        "--set", f"repository={cliArgs.repository}",
        "--set", f"gitTag={cliArgs.git_tag}",
        "--set", f"identityPlatForm.apiKey={cliArgs.identity_api_key}",
        "--set", f"identityPlatForm.authDomain={cliArgs.identity_auth_domain}",
        "--set", f"gc_project_id={cliArgs.gc_project_id}",
        "--set", f"domain={cliArgs.domain_name}",
        "--set", f"subdomain={tenant_dns}"
      ],
      check=True
    )

    annotation_key = "shared-gateway-access"
    annotation_value = "true"
    subprocess.run(
      [
        "kubectl", "annotate",
        "namespace", tenant_namespace,
        f"{annotation_key}='{annotation_value}'",
        "--overwrite"
      ],
      check=True
    )

    print(f"Backend for tenant '{tenant_id}' deployed successfully.")
    print(f"Deploying frontend in namespace '{tenant_namespace}'...")
    subprocess.run(
      [
        "helm", "upgrade", "--install", f"park-frontend-{tenant_id}", "./helm/frontend",
        "-n", tenant_namespace,
        "--set", f"repository={cliArgs.repository}",
        "--set", f"gitTag={cliArgs.git_tag}",
        "--set", f"identityPlatForm.apiKey={cliArgs.identity_api_key}",
        "--set", f"identityPlatForm.authDomain={cliArgs.identity_auth_domain}",
        "--set", f"gc_project_id={cliArgs.gc_project_id}",
        "--set", f"backendUrl=http://{tenant_dns}.{cliArgs.domain_name}",
        "--set", f"domain={cliArgs.domain_name}",
        "--set", f"subdomain={tenant_dns}"
      ],
      check=True
    )
  print("Kubernetes (Helm) sync complete.")


# ------------------------------------------------------------------------------
# Main script workflow
# ------------------------------------------------------------------------------
def main():
  args = parse_args()
  # 1. Read tenants from GCS
  bucket_name = args.bucket_name
  tenants = read_tenants_from_gcs(bucket_name=bucket_name, file_name="tenants.json")
  print(f"Retrieved {len(tenants)} tenants from GCS bucket '{bucket_name}'.")

  # 2. Generate a tfvars JSON file (with additional fields)
  tfvars_file = "terraform/staging/tenants.tfvars.json"
  generate_tfvars_json(
    tenants=tenants,
    output_file=tfvars_file,
    cliArgs=args
  )

  # 3. terraform plan
  run_terraform_plan(tfvars_file="tenants.tfvars.json")

  # 4. terraform apply
  # Prompt user to confirm changes
  confirm = input("Do you want to apply the changes with 'terraform apply'? (yes/no): ").strip().lower()
  if confirm != 'yes':
    print("Aborting 'terraform apply'.")
    return

  run_terraform_apply(tfvars_file="tenants.tfvars.json")

  # 5. Sync Kubernetes deployments (Helm releases)
  sync_k8s_deployments_with_tenants(
      tenants=tenants,
      cliArgs=args
  )


if __name__ == "__main__":
  main()
