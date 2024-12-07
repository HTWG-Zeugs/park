import admin from "firebase-admin";

const validateFirebaseIdToken = async (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];

  if (!authorizationHeader) {
    return res.status(403).send("No token provided");
  }

  const token = authorizationHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    res.status(403).send("Unauthorized");
  }
};

export default validateFirebaseIdToken;
