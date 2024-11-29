
export class ParkingInvoice {
    id: string;
    userId: string;
    entryTimestamp: Date;
    exitTimestamp: Date;
    paymentTimestamp: Date;
    total: number;
    isPayed: boolean;
}