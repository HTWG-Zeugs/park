
export class ParkingInvoice {
    id: string;
    ticketId: string;
    entryTimestamp: Date;
    exitTimestamp: Date;
    paymentTimestamp: Date;
    total: number;
}