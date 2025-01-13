#!/usr/bin/env python3

import json
import subprocess
import argparse
from google.cloud import storage
from dataclasses import dataclass, asdict

@dataclass
class CliArgs:
  action: str = ""
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


@dataclass
class DeploymentInfo:
  git_tag: str = ""


def parse_args() -> CliArgs:
  parser = argparse.ArgumentParser(description="Sync tenants with Terraform and Helm.")
  parser.add_argument(
     "--action",
      required=True,
      choices=["plan", "apply"],
      help="Action to perform (plan or apply)."
  )
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

  if args.action == "apply":
    if not args.repository:
      parser.error("--repository is required when action is 'apply'.")

  return CliArgs(
    action=args.action,
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

def run_subprocess(cmd: list, cwd: str = None):
  """
  Runs a subprocess command and returns the stdout/stderr.
  """
  try:
    proc = subprocess.run(
        cmd,
        check=True,
        capture_output=True,
        text=True,
        cwd=cwd
    )
    return proc.stdout
  except subprocess.CalledProcessError as e:
    print("Command failed!")
    print("Return code:", e.returncode)
    print(e.stderr)
    exit(1)

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

def read_deployment_info_from_gcs(bucket_name: str, file_name: str = "deployment.json") -> DeploymentInfo:
  """
  Reads deployment information from a Google Cloud Storage bucket.
  Returns a dictionary with the following keys:
  {
    "gitTag": "...",
  } 
  """
  client = storage.Client()
  bucket = client.bucket(bucket_name)
  blob = bucket.blob(file_name)

  # Check if the file exists in the bucket
  if not blob.exists():
    return {}

  data = blob.download_as_text(encoding="utf-8")
  deployment_info = json.loads(data)
  return DeploymentInfo(**deployment_info)

def write_deployment_info_to_gcs(bucket_name: str, deployment_info: DeploymentInfo, file_name: str = "deployment.json"):
  """
  Writes deployment information to a Google Cloud Storage bucket.
  """
  client = storage.Client()
  bucket = client.bucket(bucket_name)
  blob = bucket.blob(file_name)

  data = json.dumps(asdict(deployment_info))
  blob.upload_from_string(data, content_type="application/json")

  print(f"Deployment information written to GCS bucket '{bucket_name}'.")

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
  out = run_subprocess(["terraform", "init"], cwd="./terraform/staging")
  print(out)

  print("Running 'terraform plan'...")
  out = run_subprocess(["terraform", "plan", f"-var-file={tfvars_file}"], cwd="./terraform/staging")
  print(out)

# ------------------------------------------------------------------------------
# 4. Run terraform apply
# ------------------------------------------------------------------------------
def run_terraform_apply(tfvars_file="tenants.tfvars.json"):
  """
  Runs `terraform apply -var-file=... -auto-approve` in the current directory.
  Prints stdout/stderr.
  """

  print("Running terraform init...")
  out = run_subprocess(["terraform", "init"], cwd="./terraform/staging")
  print(out)

  print("Running 'terraform apply'...")
  out = run_subprocess(["terraform", "apply", f"-var-file={tfvars_file}", "-auto-approve"], cwd="./terraform/staging")
  print(out)


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
  
  if not cliArgs.is_github_actions:
    # Get cluster credentials
    cmd = [
        "gcloud", 
        "container", 
        "clusters", 
        "get-credentials", f"{cliArgs.gc_project_id}-gke", 
        "--region", cliArgs.region
      ]
    run_subprocess(cmd)
  

  # Deploy the infrastructure chart
  create_and_annotate_namespace("infra-ns")

  print("Deploying infrastructure chart...")
  cmd = [
      "helm", "upgrade", "--install" , "park-infra", "./helm/infrastructure",
      "-n", "infra-ns",
      "--set", f"repository={cliArgs.repository}",
      "--set", f"gitTag={cliArgs.git_tag}",
      "--set", f"identityPlatForm.apiKey={cliArgs.identity_api_key}",
      "--set", f"identityPlatForm.authDomain={cliArgs.identity_auth_domain}",
      "--set", f"gc_project_id={cliArgs.gc_project_id}",
      "--set", f"domain={cliArgs.domain_name}"
    ]
  run_subprocess(cmd)

  # Convert the list of tenantIds for easy lookups
  tenant_namespaces = [ create_tenant_namespace_name(t["tenantId"]) for t in tenants]

  print("Listing existing Helm releases in all namespaces...")
  cmd = ["helm", "list", "--all-namespaces", "-o", "json"]
  stdout = run_subprocess(cmd)

  existing_releases = json.loads(stdout)

  existing_release_namespaces = []
  for release_info in existing_releases:
    release_name = release_info["name"]
    release_ns = release_info["namespace"]
    if release_name.startswith("park-backend-") or release_name.startswith("park-frontend-"):
      existing_release_namespaces.append(release_ns)

  # Uninstall releases that are no longer in the tenants list
  for release_ns in existing_release_namespaces:
    if release_ns not in tenant_namespaces:
      print(f"Deleting namespace '{release_ns}' because it's not in the tenants list...")
      run_subprocess(["kubectl", "delete", "namespace", release_ns])

  # Install new releases for newly-added tenants
  for tenant in tenants:
    tenant_id = tenant["tenantId"]
    tenant_dns = tenant["dns"]
    tenant_namespace = create_tenant_namespace_name(tenant_id)
    release_name = create_tenant_release_name("backend", tenant_id)

    print(f"Installing/updating deployment for tenant '{tenant_id}'...")

    create_and_annotate_namespace(tenant_namespace)
    cmd = [
        "helm", "upgrade", "--install", release_name, "./helm/backend",
        "-n", tenant_namespace,
        "--set", f"repository={cliArgs.repository}",
        "--set", f"gitTag={cliArgs.git_tag}",
        "--set", f"identityPlatForm.apiKey={cliArgs.identity_api_key}",
        "--set", f"identityPlatForm.authDomain={cliArgs.identity_auth_domain}",
        "--set", f"gc_project_id={cliArgs.gc_project_id}",
        "--set", f"domain={cliArgs.domain_name}",
        "--set", f"subdomain={tenant_dns}",
        "--set", f"authenticationService.url=http://{cliArgs.domain_name}/auth",
        "--set", f"infrastructureManagement.url=http://{cliArgs.domain_name}/infra", #TODO: Change this to the actual URL
      ]
    run_subprocess(cmd)
    
    release_name = create_tenant_release_name("frontend", tenant_id)
    cmd = [
        "helm", "upgrade", "--install", release_name, "./helm/frontend",
        "-n", tenant_namespace,
        "--set", f"repository={cliArgs.repository}",
        "--set", f"gitTag={cliArgs.git_tag}",
        "--set", f"identityPlatForm.apiKey={cliArgs.identity_api_key}",
        "--set", f"identityPlatForm.authDomain={cliArgs.identity_auth_domain}",
        "--set", f"gc_project_id={cliArgs.gc_project_id}",
        "--set", f"frontend.env.authUrl=http://{cliArgs.domain_name}/auth",
        "--set", f"frontend.env.infrastructureUrl=http://{cliArgs.domain_name}/infra", #TODO: Change this to the actual URL
        "--set", f"frontend.env.propertyUrl=http://{tenant_dns}{cliArgs.domain_name}/property",
        "--set", f"frontend.env.parkingUrl=http://{tenant_dns}{cliArgs.domain_name}/parking",
        "--set", f"domain={cliArgs.domain_name}",
        "--set", f"subdomain={tenant_dns}"
      ]
    run_subprocess(cmd)
    
  print("Deployment sync complete.")

def create_and_annotate_namespace(namespace: str):

  # Check if the namespace already exists
  result = subprocess.run(
    ["kubectl", "get", "namespace", namespace],
    capture_output=True,
    text=True
  )
  if result.returncode == 0:
    print(f"Namespace '{namespace}' already exists. Skipping creation.")
  else:
    print(f"Creating namespace '{namespace}'...")
    cmd = ["kubectl", "create", "namespace", namespace]
    run_subprocess(cmd)
    

  annotation_key = "shared-gateway-access"
  annotation_value = "true"
  cmd = [
      "kubectl", "annotate",
      "namespace", namespace,
      f"{annotation_key}={annotation_value}",
      "--overwrite"
    ]
  run_subprocess(cmd)


# ------------------------------------------------------------------------------
# Main script workflow
# ------------------------------------------------------------------------------
def main():
  args = parse_args()
  # 1. Read tenants from GCS
  bucket_name = args.bucket_name
  tenants = read_tenants_from_gcs(bucket_name=bucket_name, file_name="tenants.json")
  print(f"Retrieved {len(tenants)} tenants from GCS bucket '{bucket_name}'.")

  # 2. Generate a .tfvars.json file from the tenant list
  tfvars_file = "./terraform/staging/tenants.tfvars.json"
  generate_tfvars_json(
    tenants=tenants,
    output_file=tfvars_file,
    cliArgs=args
  )

  # 3. If action is "plan", run terraform plan and return
  if args.action == "plan":
    run_terraform_plan(tfvars_file="tenants.tfvars.json")
    return

  # 4. If action is "apply", run terraform apply
  run_terraform_apply(tfvars_file="tenants.tfvars.json")

  if args.git_tag:
    # Update the deployment info in GCS
    deployment_info = DeploymentInfo(git_tag=args.git_tag)
    write_deployment_info_to_gcs(bucket_name, deployment_info, file_name="deployment.json")

  else:
    # Read the deployment info from GCS
    deployment_info = read_deployment_info_from_gcs(bucket_name, file_name="deployment.json")
    args.git_tag = deployment_info.git_tag

  # 4. Sync Kubernetes deployments (Helm releases)
  sync_k8s_deployments_with_tenants(
      tenants=tenants,
      cliArgs=args
  )


if __name__ == "__main__":
  main()
