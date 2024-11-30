
export class ChargingSession {
    id: string;
    userId: string;
    garageId: string;
    chargingStationId: string;
    sessionStartedTimestamp: Date;
    sessionFinishedTimestamp: Date | undefined;
    kWhConsumed: number;
}