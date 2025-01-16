import { Router } from "express";
import { CreateTenantInfrastructureRequestObject } from "../../../shared/CreateTenantInfrastructureRequestObject";
import axios from "axios";
import verifyAuthToken from "../middleware/validateOAuth";

const GITHUB_ACTION_TOKEN = process.env.GITHUB_ACTION_TOKEN;
const GITHUB_TENANT_WORKFLOW_ID = process.env.GITHUB_TENANT_WORKFLOW_ID;
const GITHUB_TENANT_WORKFLOW_BRANCH = process.env.GITHUB_TENANT_WORKFLOW_BRANCH;

const router = Router();

router.post("/add", verifyAuthToken, async (req, res) => {
  const tenantRequest: CreateTenantInfrastructureRequestObject = req.body;
  if(tenantRequest.type === "enterprise"){  
    dispatchWorkflow("add", tenantRequest.tenantId, tenantRequest.subdomain)
    .then(() => {
      res.status(200).send("Tenant created");
    })
    .catch((error) => {
      console.error("Error creating tenant:", error);
      res.status(500).send("Error creating tenant");
    });
  }
});

router.delete("/delete", verifyAuthToken, (req, res) => {
  const tenantId = req.body.tenantId;
  if (tenantId === "enterprise") {
    dispatchWorkflow("remove", tenantId)
    .then(() => {
      res.send("Tenant deleted");
      return;
    })
    .catch((error) => {
      console.error("Error deleting tenant:", error);
      res.status(500).send("Error deleting tenant");
    });
  }
  res.status(200).send("Nothing to do");
});

async function dispatchWorkflow(action: string, tenantId: string, subdomain: string = "") {
  await axios.post(
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