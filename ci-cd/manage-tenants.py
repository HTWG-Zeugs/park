#!/usr/bin/env python3

import argparse
import json
import sys
from google.cloud import storage


def read_json_from_gcs(bucket_name: str, file_name: str = "tenants.json") -> list:
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


def write_json_to_gcs(bucket_name: str, tenants: list, file_name: str = "tenants.json"):
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
    print(f"Tenant '{tenant_id}' added with DNS '{tenant_dns}'.")
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


def main():
    parser = argparse.ArgumentParser(
        description="Add or remove tenants in a tenants.json file stored in GCS."
    )
    parser.add_argument(
        "--gcs-bucket",
        required=True,
        help="GCS bucket name where tenants.json is stored."
    )
    parser.add_argument(
        "--gcs-file",
        default="tenants.json",
        help="Name of the tenants.json file in the GCS bucket (default: tenants.json)."
    )
    parser.add_argument(
        "--action",
        required=True,
        choices=["add", "remove"],
        help="Whether to add or remove a tenant."
    )
    parser.add_argument(
        "--tenant-id",
        required=True,
        help="The tenantId for the tenant to add/remove."
    )
    parser.add_argument(
        "--tenant-dns",
        required=False,
        default=None,
        help="The 'dns' value for the tenant (required if action=add)."
    )

    args = parser.parse_args()

    try:
        # Read current tenants
        tenants = read_json_from_gcs(args.gcs_bucket, args.gcs_file)
    except FileNotFoundError as e:
        print(e)
        sys.exit(1)  # Exit or handle differently (e.g., start with an empty list)

    # Modify the tenants list
    if args.action == "add":
        if not args.tenant_dns:
            parser.error("For action=add, you must provide --tenant-dns.")
        tenants = add_tenant(tenants, args.tenant_id, args.tenant_dns)
    else:  # action == "remove"
        tenants = remove_tenant(tenants, args.tenant_id)

    # Write updated tenants
    write_json_to_gcs(args.gcs_bucket, tenants, args.gcs_file)


if __name__ == "__main__":
    main()
