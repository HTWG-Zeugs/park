import { Router } from "express";
import { AnalyticsRepo } from "./analyticsRepo";
import { OccupancyStatus } from "../../../shared/OccupancyStatus"
import { DefectStatusRecord } from "../../../shared/DefectStatusRecord"
import { OccupancyRecord } from "./models/occupancyRecord";
import { NumberRecord } from "./models/numberRecord";

const router = Router();

const repository = new AnalyticsRepo();

router.put("/parking/status/:garageId", (req, res) => {
  // save timestamp and Occupancy status in the garageId collection at this time
  try {
    const garageId: string = req.params.garageId;
    const status: OccupancyStatus = req.body;
    const record: OccupancyRecord = {
      timestamp: new Date(),
      totalSpaces: status.totalSpaces,
      occupiedSpaces: status.occupiedSpaces
    }
    // store record in repo with garageId as param
    res.status(200).send('success');
  } catch (e) {
    res.status(500).send('Failed to record parking occupancy update: '+ e);
  }
})

router.get("/parking/status/:garageId/:timestamp", (req, res) => {
  // get parking status for the timestamp or the last saved timestamp
  try {
    const garageId: string = req.params.garageId;
    const timestamp: string = req.params.timestamp;
    // get parking status record from garageId repo with timestamp as param
    const status: OccupancyRecord = {}
    res.status(200).send(status);
  } catch (e) {
    res.status(500).send(`Failed getting parking occupancy status for garage with id ${req.params.garageId}: ${e}`);
  }
})

router.get("/parking/status/:garageId/:start/:end", (req, res) => {
  // get parking status array in range
  try {
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    // get parking status record in range from garageId repo with timestamps as params
    const statusEntries: OccupancyRecord[] = []
    res.status(200).send(statusEntries);
  } catch (e) {
    res.status(500).send(`Failed getting parking occupancy status entries for garage with id ${req.params.garageId}: ${e}`);
  }
})

router.put("/parking/duration/:garageId", (req, res) => {
  // add new parking duration record from parking session
  try {
    const garageId: string = req.params.garageId;
    const parkingDuration: number = req.body;
    const durationRecord: NumberRecord = {
      timestamp: new Date(),
      value: parkingDuration
    };
    // store parking duration record in garageId collection from repo
    res.status(200).send('success');
  } catch (e) {
    res.status(500).send(`Failed to record parking duration for garage with id ${req.params.garageId}. ${e}`);
  }
})

router.get("/parking/duration/:garageId/:start/:end", (req, res) => {
  // get parking duration array for garage in range
  try {
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    // get parking duration record in range from garageId repo with timestamps as params
    const durationEntries: NumberRecord[] = []
    res.status(200).send(durationEntries);
  } catch (e) {
    res.status(500).send(`Failed getting parking duration entries for garage with id ${req.params.garageId}: ${e}`);
  }
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
  try {
    const garageId: string = req.params.garageId;
    const timestamp: string = req.params.timestamp;
    // get charging status record from garageId repo with timestamp as param
    const status: OccupancyRecord = {}
    res.status(200).send(status);
  } catch (e) {
    res.status(500).send(`Failed getting charging occupancy status for garage with id ${req.params.garageId}: ${e}`);
  }
})

router.get("/charging/status/:garageId/:start/:end", (req, res) => {
  // get charging status array in range
  try {
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    // get charging status record in range from garageId repo with timestamps as params
    const statusEntries: OccupancyRecord[] = []
    res.status(200).send(statusEntries);
  } catch (e) {
    res.status(500).send(`Failed getting charging occupancy status entries for garage with id ${req.params.garageId}: ${e}`);
  }
})

router.put("/charging/powerConsumed/:garageId", (req, res) => {
  // add new record for consumed power from charging session in garage
  try {
    const garageId: string = req.params.garageId;
    const powerConsumed: number = req.body;
    const consumptionRecord: NumberRecord = {
      timestamp: new Date(),
      value: powerConsumed
    };
    // store power consumption record in garageId collection from repo
    res.status(200).send('success');
  } catch (e) {
    res.status(500).send(`Failed to record power consumption for garage with id ${req.params.garageId}. ${e}`);
  }
})

router.get("/charging/powerConsumed/:garageId/:start/:end", (req, res) => {
  // get records for consumed power for garage in range
  try {
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    // get power consumption record in range from garageId repo with timestamps as params
    const consumptionEntries: NumberRecord[] = []
    res.status(200).send(consumptionEntries);
  } catch (e) {
    res.status(500).send(`Failed getting power consumption entries for garage with id ${req.params.garageId}: ${e}`);
  }
})

router.put("/charging/turnover/:garageId", (req, res) => {
  // add new record for turnover from charging session in garage
  try {
    const garageId: string = req.params.garageId;
    const turnover: number = req.body;
    const turnoverRecord: NumberRecord = {
      timestamp: new Date(),
      value: turnover
    };
    // store turnover record in garageId collection from repo
    res.status(200).send('success');
  } catch (e) {
    res.status(500).send(`Failed to record turnover for garage with id ${req.params.garageId}. ${e}`);
  }
})

router.get("/charging/turnover/:garageId/:start/:end", (req, res) => {
  // get records for charging turnover for garage in range
  try {
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    // get turnover record in range from garageId repo with timestamps as params
    const turnoverEntries: NumberRecord[] = []
    res.status(200).send(turnoverEntries);
  } catch (e) {
    res.status(500).send(`Failed getting turnover entries for garage with id ${req.params.garageId}: ${e}`);
  }
})


router.put("/defects/status/:garageId", (req, res) => {
  // add new entry for change in defect status
  // ("x open, y in progress, z closed")
  try {
    const garageId: string = req.params.garageId;
    const defectStatus: DefectStatusRecord = req.body;
    // store defect status in garageId collection from repo
    res.status(200).send('success');
  } catch (e) {
    res.status(500).send(`Failed to record defect status for garage with id ${req.params.garageId}. ${e}`);
  }
})

router.get("/defects/status/:garageId/:timestamp", (req, res) => {
  // get defect status entry for timestamp or the last saved timestamp
  try {
    const garageId: string = req.params.garageId;
    const start: string = req.params.timestamp;
    // get defect status record at timestamp from garageId repo
    const defectStatus: DefectStatusRecord= {}
    res.status(200).send(defectStatus);
  } catch (e) {
    res.status(500).send(`Failed getting defect status for garage with id ${req.params.garageId}: ${e}`);
  }
})

router.get("/defects/status/:garageId/:start/:end", (req, res) => {
  // get defect status entry in range
  try {
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    // get defect status record in range from garageId repo with timestamps as params
    const defectStatusEntries: DefectStatusRecord[] = []
    res.status(200).send(defectStatusEntries);
  } catch (e) {
    res.status(500).send(`Failed getting defect status entries for garage with id ${req.params.garageId}: ${e}`);
  }
})


router.put("/requests/:tenantId/:timestamp", (req, res) => {
  // increase request count entry for that day or create new entry for a new day
  try {
    const garageId: string = req.params.tenantId;
    const start: string = req.params.timestamp;
    //get request count from repo
    //increase count
    //store new count in repo
    res.status(200).send('success');
  } catch (e) {
    res.status(500).send(`Failed updating request count for tenant ${req.params.tenantId}: ${e}`);
  }
})

router.get("/requests/:tenantId/:from/:to", (req, res) => {
  // get request count array for the days in the range
  try {
    const garageId: string = req.params.tenantId;
    const start: string = req.params.from;
    const end: string = req.params.to;
    // get the request counts for the days in range(from,to)
    const tenantRequestEntries: NumberRecord[] = []
    res.status(200).send(tenantRequestEntries);
  } catch (e) {
    res.status(500).send(`Failed getting tenant request entries for tenant ${req.params.tenantId}: ${e}`);
  }
})

export default router;