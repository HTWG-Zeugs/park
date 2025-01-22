import { ChargingInvoice } from "../models/chargingInvoice";
import { ChargingSession } from "../models/chargingSession";
import { Garage } from "../models/garage";
import { ParkingInvoice } from "../models/parkingInvoice";
import { Ticket } from "../models/ticket";

export interface Repository {
    createGarage(garage: Garage): Promise<void>;
    updateGarage(garage: Garage): Promise<void>;
    getGarage(garageId: string): Promise<Garage>;
    deleteGarage(garageId: string): Promise<void>;

    createTicket(ticket: Ticket): Promise<void>;
    updateTicket(ticket: Ticket): Promise<void>;
    getTicket(ticketId: string): Promise<Ticket>;

    createChargingSession(session: ChargingSession): Promise<void>;
    updateChargingSession(session: ChargingSession): Promise<void>;
    getChargingSession(sessionId: string): Promise<ChargingSession>;

    createChargingInvoice(invoice: ChargingInvoice): Promise<void>;
    updateChargingInvoice(invoice: ChargingInvoice): Promise<void>;
    getChargingInvoice(invoiceId: string): Promise<ChargingInvoice>;

    createParkingInvoice(invoice: ParkingInvoice): Promise<void>;
    updateParkingInvoice(invoice: ParkingInvoice): Promise<void>;
    getParkingInvoice(invoiceId: string): Promise<ParkingInvoice>;
}