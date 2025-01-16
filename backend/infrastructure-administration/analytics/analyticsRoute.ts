import { Router } from "express";
import { AnalyticsRepo } from "./analyticsRepo";
import { OccupancyStatus } from "../../../shared/OccupancyStatus";
import { DefectStatusRecord } from "../../../shared/DefectStatusRecord";
import { OccupancyRecord } from "../../../shared/OccupancyRecord";
import { NumberRecord } from "../../../shared/NumberRecord";
import validateFirebaseIdToken from "../middleware/validateFirebaseIdToken";
import verifyAuthToken from "../middleware/validateOAuth";
import jwt from "jsonwebtoken";

const router = Router();
const repository = new AnalyticsRepo();

router.put("/parking/status/:tenantId/:garageId", verifyAuthToken, async (req, res) => {
  // save timestamp and Occupancy status in the garageId collection at this time
  try {
    const tenantId: string = req.params.tenantId;
    const garageId: string = req.params.garageId;
    const status: OccupancyStatus = req.body;
    const record: OccupancyRecord = {
      timestamp: new Date(),
      totalSpaces: status.totalSpaces,
      occupiedSpaces: status.occupiedSpaces,
    };
    await repository.createParkingStatusRecord(tenantId, garageId, record);
    res.status(200).send("success");
  } catch (e) {
    res.status(500).send("Failed to record parking occupancy update: " + e);
  }
});

router.get("/parking/status/:garageId/:timestamp", validateFirebaseIdToken, async (req, res) => {
  // get parking status for the timestamp or the last saved timestamp
  try {
    const tenantId: string = getTenantId(req);
    const garageId: string = req.params.garageId;
    const timestamp: string = req.params.timestamp;
    const status: OccupancyRecord = await repository.getParkingStatusRecord(
      tenantId,
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

router.get("/parking/status/:garageId/:start/:end", validateFirebaseIdToken, async (req, res) => {
  // get parking status array in range
  try {
    const tenantId: string = getTenantId(req);
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    const statusEntries: OccupancyRecord[] =
      await repository.getParkingStatusRecords(
        tenantId,
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

router.put("/parking/duration/:tenantId/:garageId/:duration", verifyAuthToken, async (req, res) => {
  // add new parking duration record from parking session
  try {
    const tenantId: string = req.params.tenantId;
    const garageId: string = req.params.garageId;
    const parkingDuration: number = Number(req.params.duration);
    const durationRecord: NumberRecord = {
      timestamp: new Date(),
      value: parkingDuration,
    };
    await repository.createParkingDurationRecord(
      tenantId,
      garageId,
      durationRecord
    );
    res.status(200).send("success");
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed to record parking duration for garage with id ${req.params.garageId}. ${e}`
      );
  }
});

router.get("/parking/duration/:garageId/:start/:end", validateFirebaseIdToken, async (req, res) => {
  // get parking duration array for garage in range
  try {
    const tenantId: string = getTenantId(req);
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    const durationEntries: NumberRecord[] =
      await repository.getParkingDurationRecords(
        tenantId,
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

router.put("/charging/status/:tenantId/:garageId", verifyAuthToken, async (req, res) => {
  // save timestamp and charging occupancy in the garageId collection at this timestamp
  try {
    const tenantId: string = req.params.tenantId;
    const garageId: string = req.params.garageId;
    const status: OccupancyStatus = req.body;
    const record: OccupancyRecord = {
      timestamp: new Date(),
      totalSpaces: status.totalSpaces,
      occupiedSpaces: status.occupiedSpaces,
    };
    await repository.createChargingStatusRecord(tenantId, garageId, record);
    res.status(200).send("success");
  } catch (e) {
    res.status(500).send("Failed to record charging occupancy update: " + e);
  }
});

router.get("/charging/status/:garageId/:timestamp", validateFirebaseIdToken, async (req, res) => {
  // get charging status for the timestamp or the last saved timestamp
  try {
    const tenantId: string = getTenantId(req);
    const garageId: string = req.params.garageId;
    const timestamp: string = req.params.timestamp;
    const status: OccupancyRecord = await repository.getChargingStatusRecord(
      tenantId,
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

router.get("/charging/status/:garageId/:start/:end", validateFirebaseIdToken, async (req, res) => {
  // get charging status array in range
  try {
    const tenantId: string = getTenantId(req);
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    const statusEntries: OccupancyRecord[] =
      await repository.getChargingStatusRecords(
        tenantId,
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

router.put("/charging/powerConsumed/:tenantId/:garageId/:consumption", verifyAuthToken, async (req, res) => {
  // add new record for consumed power from charging session in garage
  try {
    const tenantId: string = req.params.tenantId;
    const garageId: string = req.params.garageId;
    const powerConsumed: number = Number(req.params.consumption);
    const consumptionRecord: NumberRecord = {
      timestamp: new Date(),
      value: powerConsumed,
    };
    await repository.createPowerConsumptionRecord(
      tenantId,
      garageId,
      consumptionRecord
    );
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
  "/charging/powerConsumed/:garageId/:start/:end", validateFirebaseIdToken,
  async (req, res) => {
    // get records for consumed power for garage in range
    try {
      const tenantId: string = getTenantId(req);
      const garageId: string = req.params.garageId;
      const start: string = req.params.start;
      const end: string = req.params.end;
      const consumptionEntries: NumberRecord[] =
        await repository.getPowerConsumptionRecords(
          tenantId,
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

router.put("/turnover/:tenantId/:garageId/:turnover", verifyAuthToken, async (req, res) => {
  // add new record for turnover
  try {
    const tenantId: string = req.params.tenantId;
    const garageId: string = req.params.garageId;
    const turnover: number = Number(req.params.turnover);
    const turnoverRecord: NumberRecord = {
      timestamp: new Date(),
      value: turnover,
    };
    await repository.createTurnoverRecord(tenantId, garageId, turnoverRecord);
    res.status(200).send("success");
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed to record turnover for garage with id ${req.params.garageId}. ${e}`
      );
  }
});

router.get("/turnover/:garageId/:start/:end", validateFirebaseIdToken, async (req, res) => {
  // get records for turnover for garage in range
  try {
    const tenantId: string = getTenantId(req);
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    const turnoverEntries: NumberRecord[] = await repository.getTurnoverRecords(
      tenantId,
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

router.put("/defects/status/:tenantId/:garageId", verifyAuthToken, async (req, res) => {
  // add new entry for change in defect status
  // ("x open, y in progress, z closed")
  try {
    const tenantId: string = req.params.tenantId;
    const garageId: string = req.params.garageId;
    const defectStatus: DefectStatusRecord = req.body;
    await repository.createDefectStatusRecord(tenantId, garageId, defectStatus);
    res.status(200).send("success");
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed to record defect status for garage with id ${req.params.garageId}. ${e}`
      );
  }
});

router.post("/defects/status/:tenantId/:garageId/:timestamp", verifyAuthToken, async (req, res) => {
  // get defect status entry for timestamp or the last saved timestamp
  try {
    const tenantId: string = req.params.tenantId;
    const garageId: string = req.params.garageId;
    const timestamp: string = req.params.timestamp;
    const defectStatus: DefectStatusRecord =
      await repository.getDefectStatusRecord(
        tenantId,
        garageId,
        new Date(timestamp)
      );
    res.status(200).send(defectStatus);
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed getting defect status for garage with id ${req.params.garageId}: ${e}`
      );
  }
});

router.get("/defects/status/:garageId/:timestamp", validateFirebaseIdToken, async (req, res) => {
  // get defect status entry for timestamp or the last saved timestamp
  try {
    const tenantId: string = getTenantId(req);
    const garageId: string = req.params.garageId;
    const timestamp: string = req.params.timestamp;
    const defectStatus: DefectStatusRecord =
      await repository.getDefectStatusRecord(
        tenantId,
        garageId,
        new Date(timestamp)
      );
    res.status(200).send(defectStatus);
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed getting defect status for garage with id ${req.params.garageId}: ${e}`
      );
  }
});

router.get("/defects/status/:garageId/:start/:end", validateFirebaseIdToken, async (req, res) => {
  // get defect status entry in range
  try {
    const tenantId: string = getTenantId(req);
    const garageId: string = req.params.garageId;
    const start: string = req.params.start;
    const end: string = req.params.end;
    const defectStatusEntries: DefectStatusRecord[] =
      await repository.getDefectStatusRecords(
        tenantId,
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

router.put("/requests/:tenantId", verifyAuthToken, async (req, res) => {
  // increase request count entry for that day or create new entry for a new day
  try {
    const tenantId = req.params.tenantId;
    const timestamp: Date = new Date();

    const requestsRecord = await repository.getRequest(
      tenantId,
      new Date(timestamp)
    );

    if (new Date(requestsRecord.timestamp).toDateString() == timestamp.toDateString()) {
      requestsRecord.value++;
      await repository.updateRequestRecord(tenantId, requestsRecord);
    } else {
      const newRecord = {
        timestamp: timestamp,
        value: 1,
      } as NumberRecord;
      await repository.storeRequestRecord(tenantId, newRecord);
    }

    res.status(200).send("success");
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed updating request count for tenant ${req.params.tenantId}: ${e}, ${e.stack}`
      );
  }
});

router.get("/requests/:tenantId/:from/:to", validateFirebaseIdToken, async (req, res) => {
  // get request count array for the days in the range
  try {
    const tenantId = req.params.tenantId;
    const start: string = req.params.from;
    const end: string = req.params.to;
    const tenantRequestEntries: NumberRecord[] = await repository.getRequests(
      tenantId,
      new Date(start),
      new Date(end)
    );
    res.status(200).send(tenantRequestEntries);
  } catch (e) {
    res
      .status(500)
      .send(
        `Failed getting tenant request entries for tenant ${req.params.tenantId}: ${e}`
      );
  }
});

function getTenantId(req): string {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.split(" ")[1];
  const decodedToken = jwt.decode(token, { complete: true });
  const tenantId = (decodedToken.payload as jwt.JwtPayload).firebase?.tenant;
  return tenantId;
}

export default router;
