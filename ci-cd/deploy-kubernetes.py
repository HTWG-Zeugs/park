#!/usr/bin/env python3

import json
import subprocess
import argparse
from google.cloud import storage
from dataclasses import dataclass, asdict

BACKEND_RELEASE_NAME = "park-backend"
FRONTEND_RELEASE_NAME = "park-frontend"

@dataclass
class CliArgs:
  bucket_name: str = ""
  gc_project_id: str = ""
  is_github_actions: bool = False
  region: str = "europe-west1"
  repository: str = ""
  git_tag: str = ""
  identity_api_key: str = ""
  identity_auth_domain: str = ""
  domain_name: str = "park-app.tech"
  infra_url: str = ""


@dataclass
class DeploymentInfo:
  git_tag: str = ""


def parse_args() -> CliArgs:
  parser = argparse.ArgumentParser()
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
    help="Name of the GCS bucket containing enterprise-tenants.json"
  )
  parser.add_argument(
    "--is-github-actions",
    action="store_true",
    default=False,
    help="If set, is_github_actions is passed as true. Defaults to false."
  )
  parser.add_argument(
    "--repository",
    required=True,
    help="Repository URL for the frontend and backend."
  )
  parser.add_argument(
    "--git-tag",
    help="Git tag for the frontend and backend."
  )
  parser.add_argument(
    "--identity-api-key",
    required=True,
    help="API key for the identity platform."
  )
  parser.add_argument(
    "--identity-auth-domain",
    required=True,
    help="Auth domain for the identity platform."
  )
  parser.add_argument(
    "--domain-name",
    default="park-app.tech",
    help="Domain name used by Terraform (default: park-app.tech)."
  )
  parser.add_argument(
    "--infra-url",
    required=True,
    help="URL for the infrastructure management service."
  )

  args = parser.parse_args()

  return CliArgs(
    bucket_name=args.gcs_bucket,
    gc_project_id=args.project_id,
    is_github_actions=args.is_github_actions,
    region=args.region,
    repository=args.repository,
    git_tag=args.git_tag,
    identity_api_key=args.identity_api_key,
    identity_auth_domain=args.identity_auth_domain,
    domain_name=args.domain_name,
    infra_url=args.infra_url
  )
    

def create_namespace_name(environment_name: str):
   return f"{environment_name}-ns"

def create_deployment_name(environment_name: str, deployment_name: str):
   return f"{environment_name}-{deployment_name}"

def create_and_annotate_namespace(namespace: str):

  # Check if the namespace already exists
  result = subprocess.run(
    ["kubectl", "get", "namespace", namespace],
    capture_output=True,
    text=True
  )
  if result.returncode != 0:
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
# 1. Read enterprise-tenants.json from GCS
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


def read_deployment_info_from_gcs(bucket_name: str, file_name: str) -> DeploymentInfo:
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


def write_deployment_info_to_gcs(bucket_name: str, deployment_info: DeploymentInfo, file_name: str):
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
# Sync Kubernetes deployments (Helm releases) with tenants list
# ------------------------------------------------------------------------------
def sync_k8s_deployments_with_tenants(enterprise_tenants, cliArgs: CliArgs):
  """
  Ensures each tenant has exactly one Helm release, named after tenantId. Any
  existing release not in the tenants list is removed.
  
  - We search across *all* namespaces for existing Helm releases.
  - We assume each tenant's Helm release name = tenantId
  - New releases are installed into the namespace: "<tenantId>-ns"
  - The --create-namespace flag is used to create these namespaces automatically
  - If a release doesn't match a tenant, we uninstall it.
  """
  
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
  print("Deploying infrastructure ...")
  create_and_annotate_namespace("infra-ns")
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

  delete_old_deployments(enterprise_tenants)

  create_and_update_deployments(enterprise_tenants, cliArgs)
    
  print("Deployment sync complete.")

def delete_old_deployments(enterprise_tenants):
    namespaces = [ create_namespace_name(t["tenantId"]) for t in enterprise_tenants]
    namespaces.append(create_namespace_name("free"))
    namespaces.append(create_namespace_name("premium"))

    print("Deleting old deployments...")
    cmd = ["helm", "list", "--all-namespaces", "-o", "json"]
    stdout = run_subprocess(cmd)

    existing_releases = json.loads(stdout)

    deployments_to_delete = []
    namespaces_to_delete = []
    for release_info in existing_releases:
      release_name = release_info["name"]
      release_ns = release_info["namespace"]
      if release_name.endswith(BACKEND_RELEASE_NAME) or release_name.endswith(FRONTEND_RELEASE_NAME):
        if release_ns not in namespaces:
          deployments_to_delete.append({ "deployment" : release_name, "namespace" : release_ns })
          namespaces_to_delete.append(release_ns)
    
    # Remove duplicate namespaces
    namespaces_to_delete = list(set(namespaces_to_delete))

    for deployment, ns in deployments_to_delete:
      print(f"Deleting deployment '{deployment}'...")
      cmd = ["helm", "uninstall", deployment, "-n", ns]
      run_subprocess(cmd)

    # Delete namespaces for tenants that are no longer in the list
    for ns in namespaces_to_delete:
      print(f"Deleting namespace '{release_ns}'...")
      run_subprocess(["kubectl", "delete", "namespace", ns])

def create_and_update_deployments(enterprise_tenants, cliArgs):
    deploy_environment(cliArgs, envinronment_name="free", subdomain="free", tenant_type="free")
    deploy_environment(cliArgs, envinronment_name="premium", subdomain="premium", tenant_type="premium")

  # Install releases for enterprise tenants
    for tenant in enterprise_tenants:
      tenant_id = tenant["tenantId"]
      subdomain = tenant["dns"]
      deploy_environment(cliArgs, 
                         envinronment_name=tenant_id, 
                         subdomain=subdomain, 
                         tenant_type="enterprise",
                         tenant_id=tenant_id)

def deploy_environment(cliArgs, envinronment_name, subdomain, tenant_type, tenant_id="NOT_SET", ):
    
  namespace = create_namespace_name(envinronment_name)
  release_name = create_deployment_name(envinronment_name, BACKEND_RELEASE_NAME)
  print(f"Deploying backend in namespace '{namespace}'...")
  create_and_annotate_namespace(namespace)
  cmd = [
    "helm", "upgrade", "--install", release_name, "./helm/backend",
    "-n", namespace,
    "--set", f"repository={cliArgs.repository}",
    "--set", f"gitTag={cliArgs.git_tag}",
    "--set", f"identityPlatForm.apiKey={cliArgs.identity_api_key}",
    "--set", f"identityPlatForm.authDomain={cliArgs.identity_auth_domain}",
    "--set", f"gc_project_id={cliArgs.gc_project_id}",
    "--set", f"domain={cliArgs.domain_name}",
    "--set", f"environment_name={envinronment_name}",
    "--set", f"subdomain={subdomain}",
    "--set", f"authenticationService.url=http://{cliArgs.domain_name}/auth",
    "--set", f"infrastructureManagement.url={cliArgs.infra_url}"
    ]
  run_subprocess(cmd)
  
  print(f"Deploying frontend in namespace '{namespace}'...")
  release_name = create_deployment_name(envinronment_name, FRONTEND_RELEASE_NAME)
  cmd = [
    "helm", "upgrade", "--install", release_name, "./helm/frontend",
    "-n", namespace,
    "--set", f"repository={cliArgs.repository}",
    "--set", f"gitTag={cliArgs.git_tag}",
    "--set", f"identityPlatForm.apiKey={cliArgs.identity_api_key}",
    "--set", f"identityPlatForm.authDomain={cliArgs.identity_auth_domain}",
    "--set", f"gc_project_id={cliArgs.gc_project_id}",
    "--set", f"frontend.env.authUrl=http://{cliArgs.domain_name}/auth",
    "--set", f"frontend.env.infrastructureUrl={cliArgs.infra_url}",
    "--set", f"frontend.env.propertyUrl=http://{subdomain}.{cliArgs.domain_name}/property",
    "--set", f"frontend.env.parkingUrl=http://{subdomain}.{cliArgs.domain_name}/parking",
    "--set", f"domain={cliArgs.domain_name}",
    "--set", f"environment_name={envinronment_name}",
    "--set", f"subdomain={subdomain}",
    "--set", f"tenant_id={tenant_id}",
    "--set", f"tenant_type={tenant_type}"
    ]
  run_subprocess(cmd)


# ------------------------------------------------------------------------------
# Main script workflow
# ------------------------------------------------------------------------------
def main():
  args = parse_args()
  
  # 1. Read all tenants from a single file "enterprise-tenants.json" in GCS
  enterprise_tenants = read_tenants_from_gcs(
    bucket_name=args.bucket_name,
    file_name="enterprise-tenants.json"
  )

  if args.git_tag:
    # Update the deployment info in GCS
    deployment_info = DeploymentInfo(git_tag=args.git_tag)
    write_deployment_info_to_gcs(args.bucket_name, deployment_info, file_name="deployment.json")

  else:
    # Read the deployment info from GCS
    deployment_info = read_deployment_info_from_gcs(args.bucket_name, file_name="deployment.json")
    args.git_tag = deployment_info.git_tag

  # Sync Kubernetes deployments (Helm releases)
  sync_k8s_deployments_with_tenants(
      enterprise_tenants=enterprise_tenants,
      cliArgs=args
  )


if __name__ == "__main__":
  main()
