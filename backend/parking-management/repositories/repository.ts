import { ChargingInvoice } from "../models/chargingInvoice";
import { ChargingSession } from "../models/chargingSession";
import { Garage } from "../models/garage";
import { OccupancyStatus } from "../models/occupancyStatus";
import { ParkingInvoice } from "../models/parkingInvoice";
import { Ticket } from "../models/ticket";

export interface Repository {
    createGarage(garage: Garage): Promise<void>;
    updateGarage(garage: Garage): Promise<void>;
    getGarage(garageId: string): Promise<Garage>;
    getParkingOccupancy(garageId: string): Promise<OccupancyStatus>;
    getChargingOccupancy(garageId: string): Promise<OccupancyStatus>;
    increaseParkingOccupancy(garageId: string): Promise<void>;
    decreaseParkingOccupancy(garageId: string): Promise<void>;
    occupyChargingStation(garageId: string, stationId: string): Promise<void>;
    vacateChargingStation(garageId: string, stationId: string): Promise<void>;
    createTicket(ticket: Ticket): Promise<void>;
    getTicket(ticketId: string): Promise<Ticket>;
    addPaymentTimestamp(ticketId: string, timestamp: Date): Promise<void>;
    createChargingSession(session: ChargingSession): Promise<void>;
    endChargingSession(sessionId: string, timestamp: Date, kWhConsumed: number): Promise<void>;
    getChargingInvoice(sessionId: string): Promise<ChargingInvoice>;
    getParkingInvoice(ticketId: string): Promise<ParkingInvoice>;
}