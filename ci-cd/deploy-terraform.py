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
  domain_name: str = "park-app.tech"

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
      "--domain-name",
      default="park-app.tech",
      help="Domain name used by Terraform (default: park-app.tech)."
  )

  args = parser.parse_args()

  return CliArgs(
    action=args.action,
    bucket_name=args.gcs_bucket,
    gc_project_id=args.project_id,
    is_github_actions=args.is_github_actions,
    region=args.region,
    create_cluster=args.create_cluster,
    domain_name=args.domain_name
  )

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
# Read tenants.json from GCS
# ------------------------------------------------------------------------------
def read_tenants_from_gcs(bucket_name: str, file_name: str):
    """
    Reads the specified JSON file from a Google Cloud Storage bucket and
    returns it as a dictionary, e.g.:
      {
        "free_tenants": [ { "tenantId": "...", "dns": "..." }, ... ],
        "premium_tenants": [ { "tenantId": "...", "dns": "..." }, ... ],
        "enterprise_tenants": [ { "tenantId": "...", "dns": "..." }, ... ]
      }

    Returns an empty dict if the file does not exist.
    """
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(file_name)

    # Check if the file exists in the bucket
    if not blob.exists():
        return {}

    data = blob.download_as_text(encoding="utf-8")
    tenants_dict = json.loads(data)
    return tenants_dict

# ------------------------------------------------------------------------------
# Generate a .tfvars.json file from the tenant list
# ------------------------------------------------------------------------------
def generate_tfvars_json(
    free_tenants,
    premium_tenants,
    enterprise_tenants,
    output_file: str,
    cliArgs: CliArgs
):
    """
    Creates a JSON file that Terraform can use for variables, e.g.:
      {
        "free_tenants": [
          { "id": "free", "domain": "free" }
        ],
        "premium_tenants": [
          { "id": "premium", "domain": "premium" }
        ],
        "enterprise_tenants": [
          { "id": "enterprise", "domain": "enterprise" }
        ],
        "is_github_actions": true,
        "region": "europe-west1",
        "project_id": "my-project-id",
        "domain_name": "my-domain.com",
        "create_cluster": true
      }
    """
    free_tenants_entries = [
        {"id": t["tenantId"], "domain": t["dns"]} for t in free_tenants
    ]
    premium_tenants_entries = [
        {"id": t["tenantId"], "domain": t["dns"]} for t in premium_tenants
    ]
    enterprise_tenants_entries = [
        {"id": t["tenantId"], "domain": t["dns"]} for t in enterprise_tenants
    ]

    # Build the data we'll write to tenants.tfvars.json
    tfvars_data = {
        "free_tenants": free_tenants_entries,
        "premium_tenants": premium_tenants_entries,
        "enterprise_tenants": enterprise_tenants_entries,
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
# Run terraform plan
# ------------------------------------------------------------------------------
def run_terraform_plan():
  """
  Runs `terraform plan` in the ./terraform/staging directory. Prints stdout/stderr.
  """
  print("Running terraform init...")
  out = run_subprocess(["terraform", "init"], cwd="./terraform/staging")
  print(out)

  print("Running 'terraform plan'...")
  out = run_subprocess(["terraform", "plan"], cwd="./terraform/staging")
  print(out)

# ------------------------------------------------------------------------------
# Run terraform apply
# ------------------------------------------------------------------------------
def run_terraform_apply():
  """
  Runs `terraform apply -auto-approve` in the ./terraform/staging directory.
  Prints stdout/stderr.
  """
  print("Running terraform init...")
  out = run_subprocess(["terraform", "init"], cwd="./terraform/staging")
  print(out)

  print("Running 'terraform apply'...")
  out = run_subprocess(["terraform", "apply", "-auto-approve"], cwd="./terraform/staging")
  print(out)

# ------------------------------------------------------------------------------
# Main script workflow
# ------------------------------------------------------------------------------
def main():
  args = parse_args()

  # 1. Read all tenants from a single file "tenants.json" in GCS
  tenants_data = read_tenants_from_gcs(
      bucket_name=args.bucket_name,
      file_name="tenants.json"
  )

  # Safely extract tenant lists
  free_tenants = tenants_data.get("free_tenants", [])
  premium_tenants = tenants_data.get("premium_tenants", [])
  enterprise_tenants = tenants_data.get("enterprise_tenants", [])

  # 2. Generate .tfvars.json from the combined tenant lists
  tfvars_file = "./terraform/staging/deployment.auto.tfvars.json"
  generate_tfvars_json(
    free_tenants=free_tenants,
    premium_tenants=premium_tenants,
    enterprise_tenants=enterprise_tenants,
    output_file=tfvars_file,
    cliArgs=args
  )

  # 3. If action is "plan", run terraform plan
  if args.action == "plan":
    run_terraform_plan()
    return

  # 4. If action is "apply", run terraform apply
  run_terraform_apply()

if __name__ == "__main__":
  main()
