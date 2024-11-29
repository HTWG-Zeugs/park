
export class ChargingSession {
    id: string;
    userId: string;
    chargingStationId: string;
    sessionStartedTimestamp: Date;
    sessionFinishedTimestamp: Date | undefined;
    kWhConsumed: number;
}