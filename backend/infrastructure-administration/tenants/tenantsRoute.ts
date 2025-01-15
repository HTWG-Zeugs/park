import { Router } from "express";
import { CreateTenantRequestObject } from "../../../shared/CreateTenantRequestObject"
import { CreateUserRequestObject } from "../../../shared/CreateUserRequestObject";
import { auth } from "firebase-admin";
import axios from "axios";

const AUTHENTICATION_SERVICE_URL = process.env.AUTHENTICATION_SERVICE_URL;
const GITHUB_ACTION_TOKEN = process.env.GITHUB_ACTION_TOKEN;
const GITHUB_TENANT_WORKFLOW_ID = process.env.GITHUB_TENANT_WORKFLOW_ID;
const GITHUB_TENANT_WORKFLOW_BRANCH = process.env.GITHUB_TENANT_WORKFLOW_BRANCH;

const router = Router();
const tenantManager = auth().tenantManager();

router.post("/add", async (req, res) => {
  const tenantRequest: CreateTenantRequestObject = req.body;

  // Create tenant
  tenantManager.createTenant({
    displayName: String(tenantRequest.name).toLowerCase(),
    emailSignInConfig: {
      enabled: true,
      passwordRequired: true
    }
  })
  .then(async (tenant) => {
    const userRequestObject: CreateUserRequestObject = {
      mail: tenantRequest.adminMail,
      name: tenantRequest.adminName,
      password: tenantRequest.adminPassword,
      tenantId: tenant.tenantId,
      tenantType: tenantRequest.type,
      role: 400
    };
    // Call authentication service to create user
    await axios.post(`${AUTHENTICATION_SERVICE_URL}/service/user`, userRequestObject);
    return tenant;
  })
  .then(async (tenant) => {
    if(tenantRequest.type === "enterprise"){  
      await dispatchWorkflow("add", tenant.tenantId, tenantRequest.subdomain);
    }
  })
  .then(() => {
    res.status(200).send("Tenant created");
  })
  .catch((error) => {
    console.error("Error creating tenant:", error);
    res.status(500).send("Error creating tenant");
  });
});

router.delete("/delete", (req, res) => {
  const tenantId = req.body.tenantId;

  tenantManager.deleteTenant(tenantId)
  .then(async () => {
    if (tenantId === "enterprise") {
      await dispatchWorkflow("remove", tenantId);
    }
  })
  .then(() => {
    res.send("Tenant deleted");
  })
  .catch((error) => {
    console.error("Error deleting tenant:", error);
    res.status(500).send("Error deleting tenant");
  });
});

function dispatchWorkflow(action: string, tenantId: string, subdomain: string = "") {
  axios.post(
    `https://api.github.com/repos/HTWG-Zeugs/park/actions/workflows/${GITHUB_TENANT_WORKFLOW_ID}/dispatches`,
    {
      ref: GITHUB_TENANT_WORKFLOW_BRANCH,
      inputs: {
        action: action,
        tenant_id: tenantId,
        tenant_subdomain: subdomain
      },
    },
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: 'Bearer ' + GITHUB_ACTION_TOKEN,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  )
}

export default router;