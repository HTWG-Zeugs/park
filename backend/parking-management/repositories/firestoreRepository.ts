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

    private garagesCollection = 'garages';
    private ticketsCollection = 'tickets';
    private parkingInvoicesCollection = 'parking-invoices';
    private chargingInvoicesCollection = 'charging-invoices';
    private chargingSessionsCollection = 'charging-sessions';

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
        await this.firestore
            .collection(this.garagesCollection)
            .doc(garage.id)
            .set(garage)

        return Promise.resolve();
    }

    async updateGarage(garage: Garage): Promise<void> {
        await this.firestore
            .collection(this.garagesCollection)
            .doc(garage.id)
            .set(garage)

        return Promise.resolve();
    }
    
    async getGarage(garageId: string): Promise<Garage> {
        const doc = await this.firestore
            .collection(this.garagesCollection)
            .doc(garageId)
            .get()

        if (doc.exists) {
            const garage: Garage = doc.data() as Garage;
            return Promise.resolve(garage);
        } else {
            return Promise.reject(new Error("Garage not found"));
        }
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