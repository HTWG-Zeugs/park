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
    createGarage(garage: Garage): Promise<void> {
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

    async getParkingOccupancy(garageId: string): Promise<OccupancyStatus> {
        const garage = await this.getGarage(garageId);
        const occupancyStatus = garage.parkingStatus as OccupancyStatus
        return occupancyStatus;
    }

    async getChargingOccupancy(garageId: string): Promise<OccupancyStatus> {
        const garage = await this.getGarage(garageId);
        const occupancyStatus = garage.chargingStatus as OccupancyStatus
        return occupancyStatus;
    }

    async increaseParkingOccupancy(garageId: string): Promise<void> {
        const data = readFileSync(garagesRepo, 'utf-8');
        const jsonData = JSON.parse(data);
        const index = jsonData.findIndex((garage: Garage) => garage.id === garageId);
        if (index !== -1) {
            const garage: Garage = jsonData[index];
            garage.parkingStatus.occupiedSpaces++;
            jsonData[index] = { ...jsonData[index], ...garage };
            writeFileSync(garagesRepo, JSON.stringify(jsonData), 'utf-8');
        }
    }

    async decreaseParkingOccupancy(garageId: string): Promise<void> {
        const data = readFileSync(garagesRepo, 'utf-8');
        const jsonData = JSON.parse(data);
        const index = jsonData.findIndex((garage: Garage) => garage.id === garageId);
        if (index !== -1) {
            const garage: Garage = jsonData[index];
            garage.parkingStatus.occupiedSpaces--;
            jsonData[index] = { ...jsonData[index], ...garage };
            writeFileSync(garagesRepo, JSON.stringify(jsonData), 'utf-8');
        }
    }

    async occupyChargingStation(garageId: string, stationId: string): Promise<void> {
        const data = readFileSync(garagesRepo, 'utf-8');
        const jsonData = JSON.parse(data);
        const index = jsonData.findIndex((garage: Garage) => garage.id === garageId);
        if (index !== -1) {
            const garage: Garage = jsonData[index];
            const stationIndex = garage.chargingStations
                .findIndex((station: ChargingStation) => station.id === stationId);
            if(stationIndex !== -1) {
                if (!garage.chargingStations[stationIndex].isOccupied) {
                    garage.chargingStations[stationIndex].isOccupied = true;
                    garage.chargingStatus.occupiedSpaces++;
                }
            }
            jsonData[index] = { ...jsonData[index], ...garage };
            writeFileSync(garagesRepo, JSON.stringify(jsonData), 'utf-8');
        }
    }

    async vacateChargingStation(garageId: string, stationId: string): Promise<void> {
        const data = readFileSync(garagesRepo, 'utf-8');
        const jsonData = JSON.parse(data);
        const index = jsonData.findIndex((garage: Garage) => garage.id === garageId);
        if (index !== -1) {
            const garage: Garage = jsonData[index];
            const stationIndex = garage.chargingStations
            .findIndex((station: ChargingStation) => station.id === stationId);
            if(stationIndex !== -1) {
                if (garage.chargingStations[stationIndex].isOccupied) {
                    garage.chargingStations[stationIndex].isOccupied = false;
                    garage.chargingStatus.occupiedSpaces--;
                }
            }
            jsonData[index] = { ...jsonData[index], ...garage };
            writeFileSync(garagesRepo, JSON.stringify(jsonData), 'utf-8');
        }
    }

    async createTicket(ticket: Ticket): Promise<void> {
        const data = readFileSync(ticketsRepo, 'utf-8');
        const tickets = JSON.parse(data) as Ticket[];
        tickets.push(ticket);
        writeFileSync(ticketsRepo, JSON.stringify(tickets), 'utf-8');
    }

    async getTicket(ticketId: string): Promise<Ticket> {
        const data = readFileSync(ticketsRepo, 'utf-8');
        const jsonData = JSON.parse(data);
        return jsonData.find((ticket: Ticket) => ticket.id === ticketId);
    }

    async addPaymentTimestamp(ticketId: string, timestamp: Date): Promise<void> {
        const data = readFileSync(ticketsRepo, 'utf-8');
        const jsonData = JSON.parse(data);
        const index = jsonData.findIndex((ticket: Ticket) => ticket.id === ticketId);
        if (index !== -1) {
            const ticket: Ticket = jsonData[index];
            ticket.paymentTimestamp = timestamp;
            jsonData[index] = { ...jsonData[index], ...ticket };
            writeFileSync(ticketsRepo, JSON.stringify(jsonData), 'utf-8');
        }
    }

    async createChargingSession(session: ChargingSession): Promise<void> {
        const data = readFileSync(chargingSessionsRepo, 'utf-8');
        const sessions = JSON.parse(data) as ChargingSession[];
        sessions.push(session);
        writeFileSync(chargingSessionsRepo, JSON.stringify(sessions), 'utf-8');
    }

    async endChargingSession(sessionId: string, timestamp: Date, kWhConsumed: number): Promise<void> {
        const data = readFileSync(chargingSessionsRepo, 'utf-8');
        const jsonData = JSON.parse(data);
        const index = jsonData.findIndex((session: ChargingSession) => session.id === sessionId);
        if (index !== -1) {
            const session: ChargingSession = jsonData[index];
            session.sessionFinishedTimestamp = timestamp;
            session.kWhConsumed = kWhConsumed;
            jsonData[index] = { ...jsonData[index], ...session };
            writeFileSync(chargingSessionsRepo, JSON.stringify(jsonData), 'utf-8');
        }
    }

    async getChargingInvoice(sessionId: string): Promise<ChargingInvoice> {
        const data = readFileSync(chargingInvoicesRepo, 'utf-8');
        const jsonData = JSON.parse(data);
        return jsonData.find((invoice: ChargingInvoice) => invoice.sessionId === sessionId);
    }

    async getParkingInvoice(ticketId: string): Promise<ParkingInvoice> {
        const data = readFileSync(parkingInvoicesRepo, 'utf-8');
        const jsonData = JSON.parse(data);
        return jsonData.find((invoice: ParkingInvoice) => invoice.ticketId === ticketId);
    }
}