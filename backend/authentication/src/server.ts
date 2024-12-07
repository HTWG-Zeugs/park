import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import { config } from "./config";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.listen(config.PORT, () =>
  console.log(`Authentication service runs on port ${config.PORT}.`)
);
