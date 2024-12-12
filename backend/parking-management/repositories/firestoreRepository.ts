import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { Repository } from "./repository";
import { ChargingInvoice } from "../models/chargingInvoice";
import { ChargingSession } from "../models/chargingSession";
import { Garage } from "../models/garage";
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
        this.createOrUpdate(garage, this.garagesCollection);
    }

    async updateGarage(garage: Garage): Promise<void> {
        this.createOrUpdate(garage, this.garagesCollection);
    }
    
    async getGarage(garageId: string): Promise<Garage> {
        const doc = await this.firestore
            .collection(this.garagesCollection)
            .doc(garageId)
            .get()

        if (doc.exists) {
            return doc.data() as Garage;
        } else {
            throw new Error("Garage not found");
        }
    }

    async createTicket(ticket: Ticket): Promise<void> {
        this.createOrUpdate(ticket, this.ticketsCollection);
    }

    async updateTicket(ticket: Ticket): Promise<void> {
        this.createOrUpdate(ticket, this.ticketsCollection);
    }

    async getTicket(ticketId: string): Promise<Ticket> {
        const doc = await this.firestore
            .collection(this.ticketsCollection)
            .doc(ticketId)
            .get()

        if (doc.exists) {
            return doc.data() as Ticket;
        } else {
            throw new Error("Ticket not found");
        }
    }

    async createChargingSession(session: ChargingSession): Promise<void> {
        this.createOrUpdate(session, this.chargingSessionsCollection);
    }

    async updateChargingSession(session: ChargingSession): Promise<void> {
        this.createOrUpdate(session, this.chargingSessionsCollection);
    }

    async getChargingSession(sessionId: string): Promise<ChargingSession> {
        const doc = await this.firestore
            .collection(this.chargingSessionsCollection)
            .doc(sessionId)
            .get()

        if (doc.exists) {
            return doc.data() as ChargingSession;
        } else {
            throw new Error("Charging session not found");
        }
    }

    async createChargingInvoice(invoice: ChargingInvoice): Promise<void> {
        this.createOrUpdate(invoice, this.chargingInvoicesCollection);
    }

    async updateChargingInvoice(invoice: ChargingInvoice): Promise<void> {
        this.createOrUpdate(invoice, this.chargingInvoicesCollection);
    }

    async getChargingInvoice(invoiceId: string): Promise<ChargingInvoice> {
        const doc = await this.firestore
            .collection(this.chargingInvoicesCollection)
            .doc(invoiceId)
            .get()

        if (doc.exists) {
            return doc.data() as ChargingInvoice;
        } else {
            throw new Error("Charging invoice not found");
        }
    }

    async createParkingInvoice(invoice: ParkingInvoice): Promise<void> {
        this.createOrUpdate(invoice, this.parkingInvoicesCollection);
    }

    async updateParkingInvoice(invoice: ParkingInvoice): Promise<void> {
        this.createOrUpdate(invoice, this.parkingInvoicesCollection);
    }

    async getParkingInvoice(invoiceId: string): Promise<ParkingInvoice> {
        const doc = await this.firestore
            .collection(this.parkingInvoicesCollection)
            .doc(invoiceId)
            .get()

        if (doc.exists) {
            return doc.data() as ParkingInvoice;
        } else {
            throw new Error("Parking invoice not found");
        }
    }

    private async createOrUpdate(obj: any, collection: string): Promise<void> {
        await this.firestore
            .collection(collection)
            .doc(obj.id)
            .set(obj)
    }
}