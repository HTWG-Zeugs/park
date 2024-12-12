import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { Repository } from "./repository";
import { ChargingInvoice } from "../models/chargingInvoice";
import { ChargingSession } from "../models/chargingSession";
import { Garage } from "../models/garage";
import { OccupancyStatus } from "../models/occupancyStatus";
import { ParkingInvoice } from "../models/parkingInvoice";
import { Ticket } from "../models/ticket";

export class FirestoreRepository implements Repository {
    firestore: Firestore;

    constructor() {
        initializeApp({
            credential: applicationDefault()
        });

        if (process.env.FIRESTORE_DB_ID === undefined)
            throw new Error("FIRESTORE_DB_ID is not defined");

        const dbId = process.env.FIRESTORE_DB_ID;
        this.firestore = getFirestore(dbId);
    }

    async createGarage(garage: Garage): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async updateGarage(garage: Garage): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    async getIsOpen(garageId: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    
    async getParkingOccupancy(garageId: string): Promise<OccupancyStatus> {
        throw new Error("Method not implemented.");
    }
    
    async getChargingOccupancy(garageId: string): Promise<OccupancyStatus> {
        throw new Error("Method not implemented.");
    }
    
    async increaseParkingOccupancy(garageId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    async decreaseParkingOccupancy(garageId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    async occupyChargingStation(garageId: string, stationId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async vacateChargingStation(garageId: string, stationId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    async createTicket(ticket: Ticket): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    async getTicket(ticketId: string): Promise<Ticket> {
        throw new Error("Method not implemented.");
    }
    
    async addPaymentTimestamp(ticketId: string, timestamp: Date): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    async createChargingSession(session: ChargingSession): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    async endChargingSession(sessionId: string, timestamp: Date, kWhConsumed: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    async getChargingInvoice(sessionId: string): Promise<ChargingInvoice> {
        throw new Error("Method not implemented.");
    }
    
    async getParkingInvoice(ticketId: string): Promise<ParkingInvoice> {
        throw new Error("Method not implemented.");
    }
}