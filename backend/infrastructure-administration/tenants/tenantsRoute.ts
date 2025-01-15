import { Router } from "express";
import { CreateTenantRequestObject } from "../../../shared/CreateTenantRequestObject"
import { CreateUserRequestObject } from "../../../shared/CreateUserRequestObject";
import { auth } from "firebase-admin";
import axios from "axios";

const AUTHENTICATION_SERVICE_URL = process.env.AUTHENTICATION_SERVICE_URL;

const router = Router();
const tenantManager = auth().tenantManager();

router.post("/add", async (req, res) => {
  const tenantRequest: CreateTenantRequestObject = req.body;

  // Create tenant
  tenantManager.createTenant({
    displayName: tenantRequest.name,
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
    await axios.post(`${AUTHENTICATION_SERVICE_URL}/user-service`, userRequestObject);
  })
  .then(() => {
    if(tenantRequest.type === "enterprise"){
      // Call github pipeline to deploy enterprise infrastructure
      // Need tenantId and subdomain
    }
  })
  .catch((error) => {
    console.error("Error creating tenant:", error);
  });
});

router.delete("/delete", (req, res) => {
  const tenantId = req.body.tenantId;

  tenantManager.deleteTenant(tenantId)
  .then(() => {
    if (tenantId === "enterprise") {
      // Call github pipeline to delete enterprise infrastructure
    }
  })
  .then(() => {
    res.send("Tenant deleted");
  })
  .catch((error) => {
    console.error("Error deleting tenant:", error);
  });
});

export default router;