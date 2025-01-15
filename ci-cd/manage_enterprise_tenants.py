#!/usr/bin/env python3

import json
import subprocess
import argparse
from google.cloud import storage
from dataclasses import dataclass

@dataclass
class CliArgs:
  action: str
  bucket_name: str
  tenant_id: str
  tenant_subdomain: str
  

def parse_args() -> CliArgs:
  parser = argparse.ArgumentParser()
  parser.add_argument(
    "--action",
    required=True,
    choices=["add", "remove"],
  )
  parser.add_argument(
      "--gcs-bucket",
      required=True,
      help="Name of the GCS bucket containing enterprise-tenants.json"
  )
  parser.add_argument(
    "--tenant-id",
    required=True,
  )
  parser.add_argument(
    "--tenant-subdomain",
    required=True,
  )

  args = parser.parse_args()

  return CliArgs(
    action=args.action,
    bucket_name=args.gcs_bucket,
    tenant_id=args.tenant_id,
    tenant_subdomain=args.tenant_subdomain
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
# Read enterprise-tenants.json from GCS
# ------------------------------------------------------------------------------
def read_tenants_from_gcs(bucket_name: str, file_name: str) -> list:
  """
  Reads the specified JSON file from a GCS bucket and returns it as a list of
  tenant objects, e.g.:
    [
      {
        "tenantId": "...",
        "dns": "..."
      },
      ...
    ]

  Returns an empty list if the file does not exist.
  """
  print(f"Downloading '{file_name}' from bucket '{bucket_name}'...")
  client = storage.Client()
  bucket = client.bucket(bucket_name)
  blob = bucket.blob(file_name)

  # Check if the file exists in the bucket
  if not blob.exists():
      return []

  data = blob.download_as_text(encoding="utf-8")
  tenants = json.loads(data)
  return tenants


def write_tenants_to_gcs(bucket_name: str, tenants: list, file_name: str):
    """
    Writes the given list of tenant objects back to the specified JSON file in
    the GCS bucket.
    """
    print(f"Uploading updated {file_name} to bucket '{bucket_name}'...")
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(file_name)

    updated_data = json.dumps(tenants, indent=2)
    blob.upload_from_string(updated_data, content_type="application/json")
    print("Upload complete.")


def add_tenant(tenants: list, tenant_id: str, tenant_dns: str) -> list:
    """
    Adds a new tenant to the list if it doesn't already exist.
    Each tenant is a dict like { "tenantId": ..., "dns": ... }.
    Returns the updated list.
    """
    # Check if tenant already exists
    for tenant in tenants:
        if tenant["tenantId"] == tenant_id:
            print(f"Tenant '{tenant_id}' already exists. No action taken.")
            return tenants

    # If not existing, add it
    tenants.append({
        "tenantId": tenant_id,
        "dns": tenant_dns
    })
    return tenants


def remove_tenant(tenants: list, tenant_id: str) -> list:
    """
    Removes the tenant with the given tenantId from the list if it exists.
    Returns the updated list.
    """
    original_len = len(tenants)
    tenants = [t for t in tenants if t["tenantId"] != tenant_id]
    if len(tenants) < original_len:
        print(f"Tenant '{tenant_id}' removed.")
    else:
        print(f"Tenant '{tenant_id}' not found. No action taken.")
    return tenants


# ------------------------------------------------------------------------------
# Main script workflow
# ------------------------------------------------------------------------------
def main():
  args = parse_args()

  # Read current tenants
  tenants = read_tenants_from_gcs(args.bucket_name, file_name="enterprise-tenants.json")
  
  # Modify the tenants list
  if args.action == "add":
      tenants = add_tenant(tenants, args.tenant_id, args.tenant_subdomain)
  else:  # action == "remove"
      tenants = remove_tenant(tenants, args.tenant_id)

  # Write updated tenants
  write_tenants_to_gcs(args.bucket_name, tenants, file_name="enterprise-tenants.json")


if __name__ == "__main__":
  main()