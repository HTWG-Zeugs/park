import { ChargingInvoice } from "../models/chargingInvoice";
import { ChargingSession } from "../models/chargingSession";
import { ChargingStation } from "../models/chargingStation";
import { Garage } from "../models/garage";
import { OccupancyStatus } from "../models/occupancyStatus";
import { ParkingInvoice } from "../models/parkingInvoice";
import { Ticket } from "../models/ticket";
import { Repository } from "./repository";
import { readFileSync, writeFileSync } from 'fs';

const location = './mocks/json-collections/';
const chargingInvoicesRepo = location + 'chargingInvoices.json';
const chargingSessionsRepo = location + 'chargingSessions.json';
const garagesRepo = location + 'garages.json';
const parkingInvoicesRepo = location + 'parkingInvoices.json';
const ticketsRepo = location + 'tickets.json';

const path = require('path');
console.log(process.cwd())
const filePath = path.resolve(__dirname, '../mocks/json-collections/garages.json');
console.log(filePath)
const data = require(filePath);


export class JsonFileRepository implements Repository {
    deleteGarage(garageId: string): Promise<void> {
        return Promise.reject();
    }
    
    async createGarage(garage: Garage): Promise<void> {
        return Promise.reject();
    }

    async updateGarage(garage: Garage): Promise<void> {
        return Promise.reject();
    }

    async getGarage(garageId: string): Promise<Garage> {
        const data = readFileSync(garagesRepo, 'utf-8');
        const jsonData = JSON.parse(data) as Garage[];
        return jsonData.find((garage: Garage) => garage.id === garageId);
    }

    async createTicket(ticket: Ticket): Promise<void> {
        const data = readFileSync(ticketsRepo, 'utf-8');
        const tickets = JSON.parse(data) as Ticket[];
        tickets.push(ticket);
        writeFileSync(ticketsRepo, JSON.stringify(tickets), 'utf-8');
    }

    async updateTicket(ticket: Ticket) {

    }

    async getTicket(ticketId: string): Promise<Ticket> {
        const data = readFileSync(ticketsRepo, 'utf-8');
        const jsonData = JSON.parse(data);
        return jsonData.find((ticket: Ticket) => ticket.id === ticketId);
    }

    async createChargingSession(session: ChargingSession): Promise<void> {
        const data = readFileSync(chargingSessionsRepo, 'utf-8');
        const sessions = JSON.parse(data) as ChargingSession[];
        sessions.push(session);
        writeFileSync(chargingSessionsRepo, JSON.stringify(sessions), 'utf-8');
    }

    async updateChargingSession(session: ChargingSession): Promise<void> {
        
    }

    async getChargingSession(sessionId: string): Promise<ChargingSession> {
        return Promise.reject();
    }
    
    async createChargingInvoice(invoice: ChargingInvoice): Promise<void> {
        
    }

    async updateChargingInvoice(invoice: ChargingInvoice): Promise<void> {
        
    }
    
    async getChargingInvoice(sessionId: string): Promise<ChargingInvoice> {
        const data = readFileSync(chargingInvoicesRepo, 'utf-8');
        const jsonData = JSON.parse(data);
        return jsonData.find((invoice: ChargingInvoice) => invoice.sessionId === sessionId);
    }

    async createParkingInvoice(invoice: ParkingInvoice): Promise<void> {
        
    }

    async updateParkingInvoice(invoice: ParkingInvoice): Promise<void> {
        
    }

    async getParkingInvoice(ticketId: string): Promise<ParkingInvoice> {
        const data = readFileSync(parkingInvoicesRepo, 'utf-8');
        const jsonData = JSON.parse(data);
        return jsonData.find((invoice: ParkingInvoice) => invoice.ticketId === ticketId);
    }
}