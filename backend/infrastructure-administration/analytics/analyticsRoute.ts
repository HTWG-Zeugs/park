import { Router } from "express";
import { AnalyticsRepo } from "./analyticsRepo";
import { OccupancyStatus } from "../../../shared/OccupancyStatus"
import { OccupancyRecord } from "./models/occupancyRecord";

const router = Router();

const repository = new AnalyticsRepo();

router.put("/parking/status/:garageId", (req, res) => {
  // save timestamp and Occupancy status in the garageId collection at this time
  try {
    const status: OccupancyStatus = req.body
    const record: OccupancyRecord = {
      timestamp: new Date(),
      totalSpaces: status.totalSpaces,
      occupiedSpaces: status.occupiedSpaces
    }
    // store record in repo
    res.status(200).send('success')
  } catch (e) {
    res.status(500).send('Failed to record parking occupancy update: '+ e)
  }
})

router.get("/parking/status/:garageId/:timestamp", (req, res) => {
  // get parking status for the timestamp or the last saved timestamp
})

router.get("/parking/status/:garageId/:start/:end", (req, res) => {
  // get parking status array in range
})

router.put("/parking/duration/:garageId", (req, res) => {
  // add new parking duration record from parking session
})

router.get("/parking/duration/:garageId/:start/:end", () => {
  // get parking duration array for garage in range
})


router.put("/charging/status/:garageId", (req, res) => {
  // save timestamp and charging occupancy in the garageId collection at this timestamp
  try {
    const status: OccupancyStatus = req.body
    const record: OccupancyRecord = {
      timestamp: new Date(),
      totalSpaces: status.totalSpaces,
      occupiedSpaces: status.occupiedSpaces
    }
    // store record in repo
    res.status(200).send('success')
  } catch (e) {
    res.status(500).send('Failed to record charging occupancy update: '+ e)
  }
})

router.get("/charging/status/:garageId/:timestamp", (req, res) => {
  // get charging status for the timestamp or the last saved timestamp
})

router.get("/charging/status/:garageId/:start/:end", (req, res) => {
  // get charging status array in range
})

router.put("/charging/powerConsumed/:garageId", (req, res) => {
  // add new record for consumed power from charging session in garage
})

router.get("/charging/powerConsumed/:garageId/:start/:end", (req, res) => {
  // get records for consumed power for garage in range
})

router.put("/charging/turnover/:garageId", () => {
  // add new record for turnover from charging session in garage
})

router.get("/charging/turnover/:garageId/:start/:end", (req, res) => {
  // get records for charging turnover for garage in range
})


router.put("/defects/status/:garageId", (req, res) => {
  // add new entry for change in defect status
  // ("x open, y in progress, z closed")
})

router.get("/defects/status/:garageId/:timestamp", (req, res) => {
  // get defect status entry for timesramp or the last saved timestamp
})

router.get("/defects/status/:garageId/:start/:end", (req, res) => {
  // get defect status entry in range
})


router.put("/requests/:tenantId", (req, res) => {
  // increase request count entry for that day or create new entry for a new day
})

router.get("/requests/:tenantId/:from/:to", (req, res) => {
  // get request count array for the days in the range
})

export default router;