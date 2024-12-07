import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  GOOGLE_CLOUD_API_KEY: process.env.IDENTITY_PLATFORM_API_KEY || "",
  TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION || "1h"
};
