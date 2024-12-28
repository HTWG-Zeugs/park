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
- Staging: `tensile-spirit-438110-i2`

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