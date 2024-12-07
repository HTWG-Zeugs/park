import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifyUserWithGoogle } from "../utils/googleAuth";
import { config } from "../config";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { email, password, tenant_id } = req.body;

  try {
    const user = await verifyUserWithGoogle(
      email,
      password,
      tenant_id,
      config.GOOGLE_CLOUD_API_KEY
    );

    const token = jwt.sign(
      { userId: user.localId, tenantId: tenant_id },
      config.JWT_SECRET,
      { expiresIn: config.TOKEN_EXPIRATION }
    );

    res
      .cookie("authToken", token, { httpOnly: true, secure: true })
      .status(200)
      .json({ message: "Login erfolgreich" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(401).json({ error: "Unknown error" });
    }
  }
});

router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("authToken").status(200).json({ message: "Logout successful" });
});

export default router;
