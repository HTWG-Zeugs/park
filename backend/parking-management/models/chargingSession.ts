
export class ChargingSession {
    id: string;
    userId: string;
    garageId: string;
    chargingStationId: string;
    sessionStartedTimestamp: Date;
    sessionFinishedTimestamp: Date | null;
    kWhConsumed: number | null;
}