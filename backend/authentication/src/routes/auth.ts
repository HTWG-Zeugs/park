import express, { Router } from "express";
import { Request, Response } from "express-serve-static-core";
import jwt from "jsonwebtoken";
import { verifyUserWithGoogle, signUpUserWithGoogle, GoogleAuthResponse} from "../utils/googleAuth";
import config from "../config";

const router = express.Router();

if (!config.API_KEY) {
  throw new Error("IDENTITY_PLATFORM_API_KEY is not defined in the config");
}
if (!config.TOKEN_EXPIRATION) {
  throw new Error("TOKEN_EXPIRATION is not defined in the config");
}

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

router.post("/sign-up", async (req: Request, res: Response) => {
  const { email, password, tenantId } = req.body;

  if (!email || !password || !tenantId) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const googleResponse = await signUpUserWithGoogle(
      email, 
      password, 
      tenantId, 
      config.API_KEY
    );

    createJWT(googleResponse, tenantId, res, "Sign up successful");
  } catch (error: any) {
    console.error(
      "Error occurred during the sign up process:",
      error.response?.data || error.message
    );

    res.status(500).json({ error: "Sign up failed" });
  }
});


router.post("/sign-in", async (req: Request, res: Response) => {
  const { email, password, tenantId } = req.body;

  if (!email || !password || !tenantId) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const googleResponse = await verifyUserWithGoogle(
      email, 
      password, 
      tenantId, 
      config.API_KEY
    );

    createJWT(googleResponse, tenantId, res, "Sign in successful");
  } catch (error) {
    console.error("Error while signing in:", error);
    res.status(401).json({ error: "Sign in failed" });
  }
});


router.post("/validate", async (req: Request, res: Response) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Token is missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    res.status(200).json({
      message: "Token is valid.",
      user: decoded,
    });
  } catch (error) {
    console.error("Token validation failed:", error);
    res.status(401).json({ error: "Invalid or eexpired token" });
  }
});

function createJWT(googleResponse: GoogleAuthResponse, tenantId: any, res: Response<any, Record<string, any>, number>, msg: string) {
  const token = jwt.sign(
    { localId: googleResponse.localId, tenantId },
    JWT_SECRET,
    { expiresIn: config.TOKEN_EXPIRATION }
  );

  res.cookie("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    message: msg,
    localId: googleResponse.localId,
  });
}

export default router;