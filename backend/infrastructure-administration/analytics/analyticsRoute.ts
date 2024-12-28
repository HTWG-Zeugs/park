import { Router } from "express";
import { AnalyticsRepo } from "./analyticsRepo";

const router = Router();

const repository = new AnalyticsRepo();

//declare endpoints
router.get("/")

export default router;