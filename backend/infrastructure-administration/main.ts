import express from "express";
import cors from "cors";
import analyticsRoute from "./analytics/analyticsRoute";

const app = express();
const port = process.env.PORT ?? 8083

app.use(cors());

app.use("/analytics", analyticsRoute);

app.listen(port, () => {
  console.log("Server running on port" + port);
});