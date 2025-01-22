# Cloud Application Development

## Prerequisites

- Install helm: https://helm.sh/docs/intro/install/

### Used technology

- Backend: NodeJS (version v20.18.0)
- Frontend: React & Vite (version 18.3.1)

### Setup dev-environment

- `cd backend && npm install`
- `cd ../frontend && npm install`

### Start the services

- Backend: `cd ./backend && npm start`
- Frontend: `cd ./frontend && npm start`

### Access the hosted service on Google Cloud

- Frontend: https://park-frontend-146651934341.europe-west3.run.app
- Backend: https://park-backend-146651934341.europe-west3.run.app/defects

## GCLOUD

Firestore local: https://firebase.google.com/docs/admin/setup?hl=de#initialize_the_sdk_in_non-google_environments

### Project ID's

- Production: `cloud-park-app`
- Staging Jonas: `tensile-spirit-438110-i2`
- Staging Lukas: `<PROJECT_ID>`

### Important commands

- `gcloud config set project $MY_PROJECT_ID`
- `gcloud auth application-default login` set ADC credentials for local development
- `gcloud auth configure-docker europe-west3-docker.pkg.dev` allow docker to push image to google registry

### Service account setup

- IAM Service Account Credentials API aktivieren: https://console.developers.google.com/apis/api/iamcredentials.googleapis.com/overview?project=839520671574

- List service accounts: `gcloud iam service-accounts list`
- Access to firestore database: `gcloud projects add-iam-policy-binding cloud-park-app --member="serviceAccount:park-manager@cloud-park-app.iam.gserviceaccount.com" --role="roles/datastore.user"`
- Access to a single firestore database: 
`gcloud projects add-iam-policy-binding tensile-spirit-438110-i2 --member='serviceAccount:authentication-firestore@tensile-spirit-438110-i2.iam.gserviceaccount.com' --role='roles/datastore.user' --condition='expression=resource.name=="projects/tensile-spirit-438110-i2/databases/authentication",title=authentication,description=authenctication'`
- Permissions to sign blobs for signed urls: `gcloud projects add-iam-policy-binding cloud-park-app --member="serviceAccount:park-manager@cloud-park-app.iam.gserviceaccount.com" --role="roles/iam.serviceAccountTokenCreator"`
- Access to gloud storage: `gsutil iam ch serviceAccount:park-manager@cloud-park-app.iam.gserviceaccount.com:roles/datastore.user gs://defect-images`
- Create a service account key and place the json file into `backend/service-account-credentials.json`

### GCS Cors configuration

- Get cors config: `gsutil cors get gs://$BUCKET_NAME`
- Set cors config
  - Create a file `cors.json` with the following content:
  ```json
  [
    {
      "maxAgeSeconds": 3600,
      "method": ["PUT", "GET", "DELETE", "POST", "HEAD"],
      "origin": ["*"],
      "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"]
    }
  ]
  ```
  - Set the cors config: `gsutil cors set cors.json gs://$BUCKET_NAME`


## Setup of infrastructure

### Pre-requisites

1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Install [Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli)
3. Install [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
4. Install GKE plugin for kubectl
    ```bash
    gcloud components install gke-gcloud-auth-plugin
    ```

### Best practices
- Store Terraform state in a remote backend
- One backend per environment
- Use versioning for the state bucket
  ```bash
  gcloud storage buckets create gs://${{PROJECT_ID}}-terraform-state --public-access-prevention --versioning
  ```
- Host TF code in a Git repository
- Use continuous integration and continuous deployment (CI/CD) pipelines
- ONLY change state through CI/CD pipelines

### Google Project

1. Created a new project in Google Cloud Platform
   - Authenticate to project in gcloud console:
     ```bash
     gcloud config set project <PROJECT_ID>
     gcloud auth application-default set-quota-project <PROJECT_ID>
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
   - firestore.googleapis.com
   - certificatemanager.googleapis.com
   - cloudbuild.googleapis.com
   - cloudfunctions.googleapis.com
   - cloudscheduler.googleapis.com
   
    ```bash
    gcloud services enable iam.googleapis.com storage.googleapis.com compute.googleapis.com container.googleapis.com artifactregistry.googleapis.com cloudresourcemanager.googleapis.com serviceusage.googleapis.com identitytoolkit.googleapis.com run.googleapis.com firestore.googleapis.com certificatemanager.googleapis.com cloudbuild.googleapis.com cloudfunctions.googleapis.com cloudscheduler.googleapis.com
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
    Terraform service account               terraform@<PROJECT_ID>.iam.gserviceaccount.com  False
    ```

6. Delete the default service account
    ```bash
    gcloud iam service-accounts delete 585856061049-compute@developer.gserviceaccount.com
    ```

7. Grant the service account the necessary permissions
    ```bash
    gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:terraform@<PROJECT_ID>.iam.gserviceaccount.com" --role="roles/editor"
    gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:terraform@<PROJECT_ID>.iam.gserviceaccount.com" --role="roles/datastore.owner"
    gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:terraform@<PROJECT_ID>.iam.gserviceaccount.com" --role="roles/resourcemanager.projectIamAdmin"
    gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:terraform@<PROJECT_ID>.iam.gserviceaccount.com" --role="roles/artifactregistry.admin"
    gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:terraform@<PROJECT_ID>.iam.gserviceaccount.com" --role="roles/iam.workloadIdentityPoolAdmin"
    gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:terraform@<PROJECT_ID>.iam.gserviceaccount.com" --role="roles/iam.serviceAccountAdmin"
    gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:terraform@<PROJECT_ID>.iam.gserviceaccount.com" --role="roles/serviceusage.serviceUsageAdmin"
    gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:terraform@<PROJECT_ID>.iam.gserviceaccount.com" --role="roles/container.admin"
    ```

8. Create a key for the service account
    ```bash
    gcloud iam service-accounts keys create terraform-key.json --iam-account=terraform@<PROJECT_ID>.iam.gserviceaccount.com
    ```

### Terraform

1. Create remote state
    ```bash
    gcloud storage buckets create gs://<PROJECT_ID>-terraform-state --public-access-prevention --versioning
    ```
2. Create a backend.tf file
    ```
    terraform {
        backend "gcs" {
            bucket  = "<PROJECT_ID>-terraform-state"
              prefix  = "terraform/state"
        }
    }
    ```

3. Initialize Terraform
    ```bash
    terraform init
    ```

### Setup a self signed certificate

1. Create a self signed certificate
    ```bash
    openssl genrsa 4096 > account.key
    ```
