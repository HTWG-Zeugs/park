import jwt from "jsonwebtoken";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { auth } from "firebase-admin";

initializeApp({
  credential: applicationDefault(),
}, "authenticationService");

const validateFirebaseIdToken = async (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];

  if (!authorizationHeader) {
    return res.status(403).send("No token provided");
  }

  const token = authorizationHeader.split(" ")[1];

  try {
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken || !decodedToken.payload) {
      throw new Error("Invalid token");
    }
    console.log(decodedToken);
    const tenantId = (decodedToken.payload as jwt.JwtPayload).firebase?.tenant;
    if (!tenantId) {
      throw new Error("No tenant ID in token");
    }
    const tenantAwareAuth = auth().tenantManager().authForTenant(tenantId);
    const verifiedToken = await tenantAwareAuth.verifyIdToken(token);
    req.user = verifiedToken;
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    res.status(403).send("Unauthorized");
  }
};

export default validateFirebaseIdToken;