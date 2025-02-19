import { Firestore, getFirestore } from "firebase-admin/firestore";
import "dotenv/config";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { OccupancyRecord } from "../../../shared/OccupancyRecord";
import { NumberRecord } from "../../../shared/NumberRecord";
import { DefectStatusRecord } from "../../../shared/DefectStatusRecord";

export class AnalyticsRepo {
  firestore: Firestore;

  private parkingStatusPrefix = "parking-status";
  private parkingDurationPrefix = "parking-duration";
  private chargingStatusPrefix = "charging-status";
  private powerConsumptionPrefix = "power-consumption";
  private turnoverPrefix = "turnover";
  private defectStatusPrefix = "defect-status";

  constructor() {
    initializeApp({
      credential: applicationDefault(),
    });

    if (process.env.ANALYTICS_DB_ID === undefined)
      throw new Error("ANALYTICS_DB_ID is not defined");

    const dbId = process.env.ANALYTICS_DB_ID;
    this.firestore = getFirestore(dbId);
  }

  async createParkingStatusRecord(
    tenantId: string,
    garageId: string,
    status: OccupancyRecord
  ): Promise<void> {
    await this.createRecord(
      tenantId,
      this.parkingStatusPrefix,
      garageId,
      status
    );
  }

  async getParkingStatusRecord(
    tenantId: string,
    garageId: string,
    timestamp: Date
  ): Promise<OccupancyRecord> {
    const querySnapshot = await this.queryDocForTimestamp(
      tenantId,
      this.parkingStatusPrefix,
      garageId,
      timestamp
    );

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as OccupancyRecord;
    } else {
      throw new Error("Unable to find occupancy record");
    }
  }

  async getParkingStatusRecords(
    tenantId: string,
    garageId: string,
    from: Date,
    to: Date
  ): Promise<OccupancyRecord[]> {
    const querySnapshot = await this.queryDocInRange(
      tenantId,
      this.parkingStatusPrefix,
      garageId,
      from,
      to
    );

    return querySnapshot.docs.map((doc) => doc.data() as OccupancyRecord);
  }

  async createParkingDurationRecord(
    tenantId: string,
    garageId: string,
    record: NumberRecord
  ): Promise<void> {
    await this.createRecord(
      tenantId,
      this.parkingDurationPrefix,
      garageId,
      record
    );
  }

  async getParkingDurationRecords(
    tenantId: string,
    garageId: string,
    from: Date,
    to: Date
  ): Promise<NumberRecord[]> {
    const querySnapshot = await this.queryDocInRange(
      tenantId,
      this.parkingDurationPrefix,
      garageId,
      from,
      to
    );

    return querySnapshot.docs.map((doc) => doc.data() as NumberRecord);
  }

  async createChargingStatusRecord(
    tenantId: string,
    garageId: string,
    status: OccupancyRecord
  ): Promise<void> {
    await this.createRecord(
      tenantId,
      this.chargingStatusPrefix,
      garageId,
      status
    );
  }

  async getChargingStatusRecord(
    tenantId: string,
    garageId: string,
    timestamp: Date
  ): Promise<OccupancyRecord> {
    const querySnapshot = await this.queryDocForTimestamp(
      tenantId,
      this.chargingStatusPrefix,
      garageId,
      timestamp
    );

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as OccupancyRecord;
    } else {
      throw new Error("Unable to find occupancy record");
    }
  }

  async getChargingStatusRecords(
    tenantId: string,
    garageId: string,
    from: Date,
    to: Date
  ): Promise<OccupancyRecord[]> {
    const querySnapshot = await this.queryDocInRange(
      tenantId,
      this.chargingStatusPrefix,
      garageId,
      from,
      to
    );

    return querySnapshot.docs.map((doc) => doc.data() as OccupancyRecord);
  }

  async createPowerConsumptionRecord(
    tenantId: string,
    garageId: string,
    record: NumberRecord
  ): Promise<void> {
    await this.createRecord(
      tenantId,
      this.powerConsumptionPrefix,
      garageId,
      record
    );
  }

  async getPowerConsumptionRecords(
    tenantId: string,
    garageId: string,
    from: Date,
    to: Date
  ): Promise<NumberRecord[]> {
    const querySnapshot = await this.queryDocInRange(
      tenantId,
      this.powerConsumptionPrefix,
      garageId,
      from,
      to
    );

    return querySnapshot.docs.map((doc) => doc.data() as NumberRecord);
  }

  async createTurnoverRecord(
    tenantId: string,
    garageId: string,
    record: NumberRecord
  ): Promise<void> {
    await this.createRecord(tenantId, this.turnoverPrefix, garageId, record);
  }

  async getTurnoverRecords(
    tenantId: string,
    garageId: string,
    from: Date,
    to: Date
  ): Promise<NumberRecord[]> {
    const querySnapshot = await this.queryDocInRange(
      tenantId,
      this.turnoverPrefix,
      garageId,
      from,
      to
    );

    return querySnapshot.docs.map((doc) => doc.data() as NumberRecord);
  }

  async createDefectStatusRecord(
    tenantId: string,
    garageId: string,
    record: DefectStatusRecord
  ): Promise<void> {
    await this.createRecord(
      tenantId,
      this.defectStatusPrefix,
      garageId,
      record
    );
  }

  async getDefectStatusRecord(
    tenantId: string,
    garageId: string,
    timestamp: Date
  ): Promise<DefectStatusRecord> {
    const querySnapshot = await this.queryDocForTimestamp(
      tenantId,
      this.defectStatusPrefix,
      garageId,
      timestamp
    );

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as DefectStatusRecord;
    } else {
      return {
        timestamp: new Date(),
        open: 0,
        closed: 0,
        inWork: 0,
        rejected: 0
      } as DefectStatusRecord
    }
  }

  async getDefectStatusRecords(
    tenantId: string,
    garageId: string,
    from: Date,
    to: Date
  ): Promise<DefectStatusRecord[]> {
    const querySnapshot = await this.queryDocInRange(
      tenantId,
      this.defectStatusPrefix,
      garageId,
      from,
      to
    );

    return querySnapshot.docs.map((doc) => doc.data() as DefectStatusRecord);
  }

  async storeRequestRecord(
    tenantId: string,
    requestsRecord: NumberRecord
  ): Promise<void> {
    await this.firestore
      .collection(`${tenantId}/requests/count`)
      .doc()
      .set(JSON.parse(JSON.stringify(requestsRecord)));
  }

  async updateRequestRecord(
    tenantId: string,
    requestsRecord: NumberRecord
  ): Promise<void> {
    const querySnapshot = await this.firestore
      .collection(`${tenantId}/requests/count`)
      .where("timestamp", "<=", new Date(requestsRecord.timestamp).toISOString())
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      await doc.ref.update(JSON.parse(JSON.stringify(requestsRecord)));
    } else {
      throw new Error("No matching document found");
    }
  }

  async getRequest(tenantId: string, timestamp: Date): Promise<NumberRecord> {
    const querySnapshot = await this.queryDocForTimestamp(
      tenantId,
      "requests",
      "count",
      timestamp
    );

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as NumberRecord;
    } else {
      const outDatedTimestamp = new Date(timestamp);
      outDatedTimestamp.setFullYear(outDatedTimestamp.getFullYear() - 1);
      return { timestamp: outDatedTimestamp, value: 0 } as NumberRecord;
    }
  }

  async getRequests(
    tenantId: string,
    from: Date,
    to: Date
  ): Promise<NumberRecord[]> {
    const querySnapshot = await this.queryDocInRange(
      tenantId,
      "requests",
      "count",
      from,
      to
    );

    return querySnapshot.docs.map((doc) => doc.data() as NumberRecord);
  }

  private async createRecord(
    tenantId: string,
    stat: string,
    garageId: string,
    obj: any
  ): Promise<void> {
    await this.firestore
      .collection(`${tenantId}/${stat}/${garageId}`)
      .doc()
      .set(JSON.parse(JSON.stringify(obj)));
  }

  private async queryDocForTimestamp(
    tenantId: string,
    stat: string,
    garageId: string,
    timestamp: Date
  ): Promise<FirebaseFirestore.QuerySnapshot<any>> {
    return await this.firestore
      .collection(`${tenantId}/${stat}/${garageId}`)
      .where("timestamp", "<=", timestamp.toISOString())
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();
  }

  private async queryDocInRange(
    tenantId: string,
    stat: string,
    garageId: string,
    from: Date,
    to: Date
  ): Promise<FirebaseFirestore.QuerySnapshot<any>> {
    const startQuerySnapshot = await this.firestore
      .collection(`${tenantId}/${stat}/${garageId}`)
      .where("timestamp", "<=", from.toISOString())
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    let latestTimestamp = from;

    if (!startQuerySnapshot.empty) {
      const latestRecord = startQuerySnapshot.docs[0].data();
      latestTimestamp = latestRecord.timestamp;
    }

    return await this.firestore
      .collection(`${tenantId}/${stat}/${garageId}`)
      .where("timestamp", ">=", new Date(latestTimestamp).toISOString())
      .where("timestamp", "<=", to.toISOString())
      .orderBy("timestamp", "asc")
      .get();
  }
}
