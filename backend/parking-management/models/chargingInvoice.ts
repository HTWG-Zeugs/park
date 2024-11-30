
export class ChargingInvoice {
    id: string;
    userId: string;
    garageId: string;
    chargingStationId: string;
    sessionStartedTimestamp: Date;
    sessionFinishedTimestamp: Date;
    kWhConsumed: number;
    total: number;
    isPayed: boolean;
    paymentTimestamp: Date | undefined;
}