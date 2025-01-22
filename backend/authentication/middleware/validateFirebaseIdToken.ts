import jwt from "jsonwebtoken";
import { auth } from "firebase-admin";
import { User } from "../models/user";
import { Repository } from "../repositories/repository";
import { FirestoreRepository } from "../repositories/firestoreRepository";

const repo: Repository = FirestoreRepository.getInstance();

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
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken || !decodedToken.payload) {
      return res.status(403).send("Invalid token");
    }

    // Get the tenant ID from the decoded token and verify the token with TenantAwareAuth.
    const tenantId = (decodedToken.payload as jwt.JwtPayload).firebase?.tenant;
    if (!tenantId) {
      console.error("No tenant ID found in token");
      return res.status(403).send("Invalid token");
    }
    const tenantAwareAuth = auth().tenantManager().authForTenant(tenantId);
    const verifiedToken = await tenantAwareAuth.verifyIdToken(token);

    // Create a User object from the verified token.
    const user_id: string = (decodedToken.payload as jwt.JwtPayload).user_id;
    const signedInUser: User = await repo.getUser(user_id);
    res.user = signedInUser;
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    res.status(403).send("Unauthorized");
  }
};

export default validateFirebaseIdToken;