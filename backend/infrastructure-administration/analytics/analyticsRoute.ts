import { Router } from "express";
import { AnalyticsRepo } from "./analyticsRepo";
import { OccupancyStatus } from "../../../shared/OccupancyStatus";
import { DefectStatusRecord } from "../../../shared/DefectStatusRecord";
import { OccupancyRecord } from "./models/occupancyRecord";
import { NumberRecord } from "./models/numberRecord";

const router = Router();
const repository = new AnalyticsRepo();

router.put("/parking/status/:garageId", async (req, res) => {
  // save timestamp and Occupancy status in the garageId collection at this time
  try {
    const garageId: string = req.params.garageId;
    const status: OccupancyStatus = req.body;
    const record: OccupancyRecord = {
      timestamp: new Date(),
      totalSpaces: status.totalSpaces,
      occupiedSpaces: status.occupiedSpaces,
    };
    repository.createParkingStatusRecord(garageId, record);
    res.status(200).send("success");
  } catch (e) {
    res.status(500).send("Failed to record parking occupancy update: " + e);
  }
});

router.get("/parking/status/:garageId/:timestamp", async (req, res) => {
  // get parking status for the timestamp or the last saved timestamp
  try {
    const garageId: string = req.params.garageId;
    const timestamp: string = req.params.timestamp;
    const status: OccupancyRecord = await repository.getParkingStatusRecord(
      garageId,
      new Date(timestamp)
    );
    res.status(200).send(status);
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed getting parking occupancy status for garage with id ${req.params.garageId}: ${e}`
      );
  }
});

router.get("/parking/status/:garageId/:start/:end", async (req, res) => {
  // get parking status array in range
  try {
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    const statusEntries: OccupancyRecord[] =
      await repository.getParkingStatusRecords(
        garageId,
        new Date(start),
        new Date(end)
      );
    res.status(200).send(statusEntries);
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed getting parking occupancy status entries for garage with id ${req.params.garageId}: ${e}`
      );
  }
});

router.put("/parking/duration/:garageId", async (req, res) => {
  // add new parking duration record from parking session
  try {
    const garageId: string = req.params.garageId;
    const parkingDuration: number = req.body;
    const durationRecord: NumberRecord = {
      timestamp: new Date(),
      value: parkingDuration,
    };
    await repository.createParkingDurationRecord(garageId, durationRecord);
    res.status(200).send("success");
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed to record parking duration for garage with id ${req.params.garageId}. ${e}`
      );
  }
});

router.get("/parking/duration/:garageId/:start/:end", async (req, res) => {
  // get parking duration array for garage in range
  try {
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    const durationEntries: NumberRecord[] =
      await repository.getParkingDurationRecords(
        garageId,
        new Date(start),
        new Date(end)
      );
    res.status(200).send(durationEntries);
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed getting parking duration entries for garage with id ${req.params.garageId}: ${e}`
      );
  }
});

router.put("/charging/status/:garageId", async (req, res) => {
  // save timestamp and charging occupancy in the garageId collection at this timestamp
  try {
    const garageId: string = req.params.garageId;
    const status: OccupancyStatus = req.body;
    const record: OccupancyRecord = {
      timestamp: new Date(),
      totalSpaces: status.totalSpaces,
      occupiedSpaces: status.occupiedSpaces,
    };
    await repository.createChargingStatusRecord(garageId, record);
    res.status(200).send("success");
  } catch (e) {
    res.status(500).send("Failed to record charging occupancy update: " + e);
  }
});

router.get("/charging/status/:garageId/:timestamp", async (req, res) => {
  // get charging status for the timestamp or the last saved timestamp
  try {
    const garageId: string = req.params.garageId;
    const timestamp: string = req.params.timestamp;
    const status: OccupancyRecord = await repository.getChargingStatusRecord(
      garageId,
      new Date(timestamp)
    );
    res.status(200).send(status);
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed getting charging occupancy status for garage with id ${req.params.garageId}: ${e}`
      );
  }
});

router.get("/charging/status/:garageId/:start/:end", async (req, res) => {
  // get charging status array in range
  try {
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    const statusEntries: OccupancyRecord[] =
      await repository.getChargingStatusRecords(
        garageId,
        new Date(start),
        new Date(end)
      );
    res.status(200).send(statusEntries);
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed getting charging occupancy status entries for garage with id ${req.params.garageId}: ${e}`
      );
  }
});

router.put("/charging/powerConsumed/:garageId", async (req, res) => {
  // add new record for consumed power from charging session in garage
  try {
    const garageId: string = req.params.garageId;
    const powerConsumed: number = req.body;
    const consumptionRecord: NumberRecord = {
      timestamp: new Date(),
      value: powerConsumed,
    };
    await repository.createPowerConsumptionRecord(garageId, consumptionRecord);
    res.status(200).send("success");
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed to record power consumption for garage with id ${req.params.garageId}. ${e}`
      );
  }
});

router.get(
  "/charging/powerConsumed/:garageId/:start/:end",
  async (req, res) => {
    // get records for consumed power for garage in range
    try {
      const garageId: string = req.params.garageId;
      const start: string = req.params.start;
      const end: string = req.params.end;
      const consumptionEntries: NumberRecord[] =
        await repository.getPowerConsumptionRecords(
          garageId,
          new Date(start),
          new Date(end)
        );
      res.status(200).send(consumptionEntries);
    } catch (e) {
      res
        .status(500)
        .send(
          `Failed getting power consumption entries for garage with id ${req.params.garageId}: ${e}`
        );
    }
  }
);

router.put("/turnover/:garageId", async (req, res) => {
  // add new record for turnover
  try {
    const garageId: string = req.params.garageId;
    const turnover: number = req.body;
    const turnoverRecord: NumberRecord = {
      timestamp: new Date(),
      value: turnover,
    };
    await repository.createTurnoverRecord(garageId, turnoverRecord);
    res.status(200).send("success");
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed to record turnover for garage with id ${req.params.garageId}. ${e}`
      );
  }
});

router.get("/turnover/:garageId/:start/:end", async (req, res) => {
  // get records for turnover for garage in range
  try {
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    const turnoverEntries: NumberRecord[] = await repository.getTurnoverRecords(
      garageId,
      new Date(start),
      new Date(end)
    );
    res.status(200).send(turnoverEntries);
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed getting turnover entries for garage with id ${req.params.garageId}: ${e}`
      );
  }
});

router.put("/defects/status/:garageId", async (req, res) => {
  // add new entry for change in defect status
  // ("x open, y in progress, z closed")
  try {
    const garageId: string = req.params.garageId;
    const defectStatus: DefectStatusRecord = req.body;
    await repository.createDefectStatusRecord(garageId, defectStatus);
    res.status(200).send("success");
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed to record defect status for garage with id ${req.params.garageId}. ${e}`
      );
  }
});

router.get("/defects/status/:garageId/:timestamp", async (req, res) => {
  // get defect status entry for timestamp or the last saved timestamp
  try {
    const garageId: string = req.params.garageId;
    const timestamp: string = req.params.timestamp;
    const defectStatus: DefectStatusRecord =
      await repository.getDefectStatusRecord(garageId, new Date(timestamp));
    res.status(200).send(defectStatus);
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed getting defect status for garage with id ${req.params.garageId}: ${e}`
      );
  }
});

router.get("/defects/status/:garageId/:start/:end", async (req, res) => {
  // get defect status entry in range
  try {
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    const defectStatusEntries: DefectStatusRecord[] =
      await repository.getDefectStatusRecords(
        garageId,
        new Date(start),
        new Date(end)
      );
    res.status(200).send(defectStatusEntries);
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed getting defect status entries for garage with id ${req.params.garageId}: ${e}`
      );
  }
});

router.put("/requests/:tenantId/:timestamp", (req, res) => {
  // increase request count entry for that day or create new entry for a new day
  try {
    const garageId: string = req.params.tenantId;
    const start: string = req.params.timestamp;
    //get request count from repo
    //increase count
    //store new count in repo
    res.status(200).send("success");
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed updating request count for tenant ${req.params.tenantId}: ${e}`
      );
  }
});

router.get("/requests/:tenantId/:from/:to", (req, res) => {
  // get request count array for the days in the range
  try {
    const garageId: string = req.params.tenantId;
    const start: string = req.params.from;
    const end: string = req.params.to;
    // get the request counts for the days in range(from,to)
    const tenantRequestEntries: NumberRecord[] = [];
    res.status(200).send(tenantRequestEntries);
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed getting tenant request entries for tenant ${req.params.tenantId}: ${e}`
      );
  }
});

export default router;
