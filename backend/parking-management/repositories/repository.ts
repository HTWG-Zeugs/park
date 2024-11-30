import { ChargingInvoice } from "../models/chargingInvoice";
import { ChargingSession } from "../models/chargingSession";
import { OccupancyStatus } from "../models/occupancyStatus";
import { ParkingInvoice } from "../models/parkingInvoice";
import { Ticket } from "../models/ticket";

export interface Repository {
    getParkingOccupancy(garageId: string): OccupancyStatus;
    getChargingOccupancy(garageId: string): OccupancyStatus;
    increaseParkingOccupancy(garageId: string): void;
    decreaseParkingOccupancy(garageId: string): void;
    occupyChargingStation(garageId: string, stationId: string): void;
    vacateChargingStation(garageId: string, stationId: string): void;
    getTicket(ticketId: string): Ticket
    addPaymentTimestamp(ticketId: string, timestamp: Date): void;
    getPaymentTimestamp(ticketId: string): Date;
    addChargingSession(session: ChargingSession): void;
    endChargingSession(sessionId: string, timestamp: Date, kWhConsumed: number): void;
    getChargingInvoice(sessionId: string): ChargingInvoice;
    getParkingInvoice(ticketId: string): ParkingInvoice;
}