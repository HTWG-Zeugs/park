import dotenv from "dotenv";

dotenv.config();

/**
 * Load environment variables from .env file and stores them in static readonly fields
 * @Elsper01
 */
export class Config {
  static readonly PORT = process.env.PORT;
  static readonly API_KEY = process.env.IDENTITY_PLATFORM_API_KEY;
  static readonly AUTH_DOMAIN = process.env.IDENTITY_PLATFORM_AUTH_DOMAIN;
  static readonly PROJECT_ID = process.env.IDENTITY_PLATFORM_PROJECT_ID;
}
