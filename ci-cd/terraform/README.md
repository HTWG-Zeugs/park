# Setup of infrastructure

## Pre-requisites

1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Install [Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli)
3. Install [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
4. Install GKE plugin for kubectl
    ```bash
    gcloud components install gke-gcloud-auth-plugin
    ```

## Best practices
- Store Terraform state in a remote backend
- One backend per environment
- Use versioning for the state bucket
  ```bash
  gcloud storage buckets create gs://${{PROJECT_ID}}-terraform-state --public-access-prevention --versioning
  ```
- Host TF code in a Git repository
- Use continuous integration and continuous deployment (CI/CD) pipelines
- ONLY change state through CI/CD pipelines


## Staging environment

### Google Project

1. Created a new project in Google Cloud Platform
   Name: `Park-Staging`
   Project ID: `park-staging-444913`
   - Select project in gcloud console:
     ```bash
     gcloud auth application-default set-quota-project park-staging-444913
     gcloud config set project park-staging-444913
     ```
2. Enabled billing
3. Enable required APIs:
   - iam.googleapis.com
   - storage.googleapis.com
   - compute.googleapis.com
   - container.googleapis.com
   - artifactregistry.googleapis.com
   - cloudresourcemanager.googleapis.com
   - serviceusage.googleapis.com
   - identitytoolkit.googleapis.com
   - run.googleapis.com
   
    ```bash
    gcloud services enable iam.googleapis.com storage.googleapis.com compute.googleapis.com container.googleapis.com artifactregistry.googleapis.com cloudresourcemanager.googleapis.com serviceusage.googleapis.com identitytoolkit.googleapis.com run.googleapis.com
    ```
4. To get a list of enabled APIs:
    ```bash
    gcloud services list --enabled
    ```
5. Created a service account for Terraform
    ```bash
    gcloud iam service-accounts create terraform --display-name "Terraform service account"
    ```
6. Get the email address of the service account
    ```bash
    gcloud iam service-accounts list
    ```
    Output:
    ```
    NAME                                    EMAIL                                                  DISABLED
    Compute Engine default service account  585856061049-compute@developer.gserviceaccount.com     False
    Terraform service account               terraform@park-staging-444913.iam.gserviceaccount.com  False
    ```

6. Delete the default service account
    ```bash
    gcloud iam service-accounts delete 585856061049-compute@developer.gserviceaccount.com
    ```

7. Grant the service account the necessary permissions
    ```bash
    gcloud projects add-iam-policy-binding park-staging-444913 --member="serviceAccount:terraform@park-staging-444913.iam.gserviceaccount.com" --role="roles/editor"
    gcloud projects add-iam-policy-binding park-staging-444913 --member="serviceAccount:terraform@park-staging-444913.iam.gserviceaccount.com" --role="roles/datastore.owner"
    gcloud projects add-iam-policy-binding park-staging-444913 --member="serviceAccount:terraform@park-staging-444913.iam.gserviceaccount.com" --role="roles/resourcemanager.projectIamAdmin"
    gcloud projects add-iam-policy-binding park-staging-444913 --member="serviceAccount:terraform@park-staging-444913.iam.gserviceaccount.com" --role="roles/artifactregistry.admin"
    gcloud projects add-iam-policy-binding park-staging-444913 --member="serviceAccount:terraform@park-staging-444913.iam.gserviceaccount.com" --role="roles/iam.workloadIdentityPoolAdmin"
    gcloud projects add-iam-policy-binding park-staging-444913 --member="serviceAccount:terraform@park-staging-444913.iam.gserviceaccount.com" --role="roles/iam.serviceAccountAdmin"
    gcloud projects add-iam-policy-binding park-staging-444913 --member="serviceAccount:terraform@park-staging-444913.iam.gserviceaccount.com" --role="roles/serviceusage.serviceUsageAdmin"
    ```

8. Create a key for the service account
    ```bash
    gcloud iam service-accounts keys create terraform-key.json --iam-account=terraform@park-staging-444913.iam.gserviceaccount.com
    ```

### Terraform

1. Create remote state
    ```bash
    gcloud storage buckets create gs://park-staging-444913-terraform-state --public-access-prevention --versioning
    ```
2. Create a backend.tf file
    ```
    terraform {
        backend "gcs" {
            bucket  = "park-staging-444913-terraform-state"
              prefix  = "terraform/state"
        }
    }
    ```

3. Initialize Terraform
    ```bash
    terraform init
    ```

4. Create a main.tf file
    ```
    provider "google" {
        credentials = file("terraform-key.json")
        project     = "park-staging-444913"
        region      = "us-central1"
    }
    ```



### Kubernetes

1. Connect to cluster
    ```bash
    gcloud container clusters get-credentials $(terraform output -raw kubernetes_cluster_name) --region $(terraform output -raw region)
    ```
2. Install nginx ingress controller
    ```bash
    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
    helm repo update
    helm install nginx-ingress ingress-nginx/ingress-nginx
    ``` 


3. Destroy cluster created by Terraform
    ```bash
    terraform destroy -target google_container_cluster.primary
    ```

