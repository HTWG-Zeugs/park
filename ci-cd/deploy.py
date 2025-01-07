#!/usr/bin/env python3

import os
import json
import subprocess
import argparse
from google.cloud import storage


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
    """
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(file_name)

    data = blob.download_as_text(encoding="utf-8")
    tenants = json.loads(data)
    return tenants


# ------------------------------------------------------------------------------
# 2. Generate a .tfvars.json file from the tenant list
# ------------------------------------------------------------------------------
def generate_tfvars_json(
    tenants,
    output_file: str,
    is_github_actions: bool,
    region: str,
    project_id: str,
    domain_name: str,
    create_cluster: bool
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
        "is_github_actions": is_github_actions,
        "region": region,
        "project_id": project_id,
        "domain_name": domain_name,
        "create_cluster": create_cluster
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
    print("Running 'terraform plan'...")
    proc = subprocess.run(
        ["terraform", "plan", f"-var-file={tfvars_file}"],
        check=True,
        capture_output=True,
        text=True
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
        text=True
    )
    print(proc.stdout)
    if proc.stderr:
        print(proc.stderr)


# ------------------------------------------------------------------------------
# 5. Sync Kubernetes deployments (Helm releases) with tenants list
# ------------------------------------------------------------------------------
def sync_k8s_deployments_with_tenants(tenants, helm_chart="mychart"):
    """
    Ensures each tenant has exactly one Helm release, named after tenantId. Any
    existing release not in the tenants list is removed.
    
    - We search across *all* namespaces for existing Helm releases.
    - We assume each tenant's Helm release name = tenantId
    - New releases are installed into the namespace: "<tenantId>-ns"
    - The --create-namespace flag is used to create these namespaces automatically
    - If a release doesn't match a tenant, we uninstall it.
    """

    # Convert the list of tenantIds for easy lookups
    tenant_ids = {t["tenantId"] for t in tenants}

    print("Listing existing Helm releases in all namespaces...")
    helm_list_proc = subprocess.run(
        ["helm", "list", "--all-namespaces", "-o", "json"],
        capture_output=True,
        text=True,
        check=True
    )
    existing_releases = json.loads(helm_list_proc.stdout)

    # We'll store them in a dict: { release_name: release_namespace }
    existing_releases_dict = {}
    for release_info in existing_releases:
        release_name = release_info["name"]
        release_ns = release_info["namespace"]
        existing_releases_dict[release_name] = release_ns

    # Uninstall releases that are no longer in the tenants list
    for release_name, release_ns in existing_releases_dict.items():
        if release_name not in tenant_ids:
            print(f"Release '{release_name}' in namespace '{release_ns}' "
                  f"no longer has a matching tenant. Uninstalling...")
            subprocess.run(
                ["helm", "uninstall", release_name, "-n", release_ns],
                check=True
            )

    # Install new releases for newly-added tenants
    for tenant in tenants:
        tenant_id = tenant["tenantId"]
        tenant_dns = tenant["dns"]
        if tenant_id not in existing_releases_dict:
            tenant_namespace = f"{tenant_id}-ns"
            print(f"Tenant '{tenant_id}' not deployed. Installing new release in namespace '{tenant_namespace}'...")
            subprocess.run(
                [
                    "helm", "install", tenant_id, helm_chart,
                    "-n", tenant_namespace,
                    "--create-namespace",
                    "--set", f"domain={tenant_dns}"
                ],
                check=True
            )

    print("Kubernetes (Helm) sync complete.")


# ------------------------------------------------------------------------------
# Main script workflow
# ------------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Sync tenants with Terraform and Helm.")
    parser.add_argument(
        "--gcs-bucket-name",
        required=True,
        help="Name of the GCS bucket containing tenants.json"
    )
    parser.add_argument(
        "--helm-chart",
        default="mychart",
        help="Helm chart to install for new tenants (default: mychart)."
    )

    # New arguments for extra Terraform variables
    parser.add_argument(
        "--is-github-actions",
        action="store_true",
        default=False,
        help="If set, is_github_actions is passed as true. Defaults to false."
    )
    parser.add_argument(
        "--region",
        default="europe-west1",
        help="Region for the cluster (default: europe-west1)."
    )
    parser.add_argument(
        "--project-id",
        default="park-staging-444913",
        help="Project ID to use in Terraform (default: park-staging-444913)."
    )
    parser.add_argument(
        "--domain-name",
        default="park-app.tech",
        help="Domain name used by Terraform (default: park-app.tech)."
    )
    parser.add_argument(
        "--create-cluster",
        action="store_true",
        default=False,
        help="If set, create_cluster is passed as true. Defaults to false."
    )

    args = parser.parse_args()

    # 1. Read tenants from GCS
    bucket_name = args.gcs_bucket_name
    tenants = read_tenants_from_gcs(bucket_name=bucket_name, file_name="tenants.json")
    print(f"Retrieved {len(tenants)} tenants from GCS bucket '{bucket_name}'.")

    # 2. Generate a tfvars JSON file (with additional fields)
    tfvars_file = "tenants.tfvars.json"
    generate_tfvars_json(
        tenants=tenants,
        output_file=tfvars_file,
        is_github_actions=args.is_github_actions,
        region=args.region,
        project_id=args.project_id,
        domain_name=args.domain_name,
        create_cluster=args.create_cluster
    )

    # 3. terraform plan
    run_terraform_plan(tfvars_file=tfvars_file)

    # 4. terraform apply
    run_terraform_apply(tfvars_file=tfvars_file)

    # 5. Sync Kubernetes deployments (Helm releases)
    sync_k8s_deployments_with_tenants(
        tenants=tenants,
        helm_chart=args.helm_chart
    )


if __name__ == "__main__":
    main()
