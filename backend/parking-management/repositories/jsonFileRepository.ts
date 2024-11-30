import { ChargingInvoice } from "../models/chargingInvoice";
import { ChargingSession } from "../models/chargingSession";
import { ChargingStation } from "../models/chargingStation";
import { Garage } from "../models/garage";
import { OccupancyStatus } from "../models/occupancyStatus";
import { ParkingInvoice } from "../models/parkingInvoice";
import { Ticket } from "../models/ticket";
import { Repository } from "./repository";
import { readFileSync, stat, writeFileSync } from 'fs';

const location = '../mocks/json-collections/';
const chargingInvoicesRepo = location + 'chargingInvoices.json';
const chargingSessionsRepo = location + 'chargingSessions.json';
const garagesRepo = location + 'garages.json';
const parkingInvoicesRepo = location + 'parkingInvoices.json';
const ticketsRepo = location + 'tickets.json';

export class JsonFileRepository implements Repository {
    getParkingOccupancy(garageId: string): OccupancyStatus {
        const garage = this.getGarage(garageId);
        const occupancyStatus = garage.parkingStatus as OccupancyStatus
        return occupancyStatus;
    }

    getChargingOccupancy(garageId: string): OccupancyStatus {
        const garage = this.getGarage(garageId);
        const occupancyStatus = garage.chargingStatus as OccupancyStatus
        return occupancyStatus;
    }

    increaseParkingOccupancy(garageId: string): void {
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

    decreaseParkingOccupancy(garageId: string): void {
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

    occupyChargingStation(garageId: string, stationId: string): void {
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

    vacateChargingStation(garageId: string, stationId: string): void {
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

    getTicket(ticketId: string): Ticket {
        const data = readFileSync(ticketsRepo, 'utf-8');
        const jsonData = JSON.parse(data);
        return jsonData.find((ticket: Ticket) => ticket.id === ticketId);
    }

    addPaymentTimestamp(ticketId: string, timestamp: Date): void {
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

    getPaymentTimestamp(ticketId: string): Date {
        return this.getTicket(ticketId).paymentTimestamp;
    }

    addChargingSession(session: ChargingSession): void {
        const data = readFileSync(chargingSessionsRepo, 'utf-8');
        const sessions = JSON.parse(data) as ChargingSession[];
        sessions.push(session);
        writeFileSync(chargingSessionsRepo, JSON.stringify(sessions), 'utf-8');
    }

    endChargingSession(sessionId: string, timestamp: Date, kWhConsumed: number): void {
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

    getChargingInvoice(sessionId: string): ChargingInvoice {
        const data = readFileSync(chargingInvoicesRepo, 'utf-8');
        const jsonData = JSON.parse(data);
        return jsonData.find((invoice: ChargingInvoice) => invoice.sessionId === sessionId);
    }

    getParkingInvoice(ticketId: string): ParkingInvoice {
        const data = readFileSync(parkingInvoicesRepo, 'utf-8');
        const jsonData = JSON.parse(data);
        return jsonData.find((invoice: ParkingInvoice) => invoice.ticketId === ticketId);
    }

    private getGarage(garageId: string): Garage {
        const data = readFileSync(garagesRepo, 'utf-8');
        const jsonData = JSON.parse(data) as Garage[];
        return jsonData.find((garage: Garage) => garage.id === garageId);
    }
}