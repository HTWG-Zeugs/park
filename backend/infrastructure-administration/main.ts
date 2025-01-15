import express from "express";
import cors from "cors";
import analyticsRoute from "./analytics/analyticsRoute";
import tenantsRoute from "./tenants/tenantsRoute";

const app = express();
const port = process.env.PORT ?? 8083

app.use(express.json());
app.use(cors());

app.use("/analytics", analyticsRoute);

app.use("/tenants", tenantsRoute);

app.listen(port, () => {
  console.log("Server running on port " + port);
});