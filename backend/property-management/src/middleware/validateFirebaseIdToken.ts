import axios from "axios";
import admin from "firebase-admin";
import { increaseRequestCounter } from "./ServiceCommunication";

const validateFirebaseIdToken = async (req, res, next) => {
  // Check if the request has an Authorization header. If not, return a 403 error.
  const authorizationHeader = req.headers["authorization"];
  if (!authorizationHeader) {
    return res.status(403).send("No authorization token provided");
  }

  // Extract the token from the Authorization header.
  const token = authorizationHeader.split(" ")[1];

  // Verify the token and decode it.
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    const tenantId = req.user.firebase.tenant;
    await increaseRequestCounter(tenantId);
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    res.status(403).send("Unauthorized");
  }
};

export default validateFirebaseIdToken;