import dotenv from "dotenv";

dotenv.config();

export default class config {
    static readonly JWT_SECRET = process.env.JWT_SECRET;
    static readonly PORT = process.env.PORT;
    static readonly API_KEY = process.env.IDENTITY_PLATFORM_API_KEY;
    static readonly TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION;
}