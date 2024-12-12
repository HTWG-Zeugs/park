import { GarageDto } from "../../shared/garageDto";
import { ChargingInvoice } from "../models/chargingInvoice";
import { ChargingSession } from "../models/chargingSession";
import { Garage } from "../models/garage";
import { OccupancyStatus } from "../models/occupancyStatus";
import { Ticket } from "../models/ticket";
import { Repository } from "../repositories/repository";

export class GarageService {
    private repo: Repository;

    constructor(repository: Repository) {
        this.repo = repository;
    }

    async createGarage(garageDto: GarageDto): Promise<void> {
        const garage: Garage = this.getGarageFromDto(garageDto);
        await this.repo.createGarage(garage);
    }

    async updateGarage(garageDto: GarageDto): Promise<void>  {
        const garage: Garage = this.getGarageFromDto(garageDto);
        this.repo.updateGarage(garage);
    }

    async getParkingOccupancy(garageId: string): Promise<OccupancyStatus> {
        const garage: Garage = await this.repo.getGarage(garageId);
        return garage.parkingStatus;
    };

    async getChargingOccupancy(garageId: string): Promise<OccupancyStatus> {
        const garage: Garage = await this.repo.getGarage(garageId);
        return garage.chargingStatus;
    };

    async handleCarEntry(garageId: string): Promise<string> {
        const garage = await this.repo.getGarage(garageId);;
        const isFree = garage.parkingStatus.occupiedSpaces < garage.parkingStatus.totalSpaces

        if (garage.isOpen && isFree) {
            const ticket: Ticket = {
                id: crypto.randomUUID(),
                garageId: garageId,
                entryTimestamp: new Date(),
                paymentTimestamp: null
            };
            this.repo.createTicket(ticket);
            garage.parkingStatus.occupiedSpaces++;
            this.repo.updateGarage(garage);
            return ticket.id;
        } else {
            throw Error('Cannot enter because garage is closed.');
        }
    };

    async handleCarExit(garageId: string): Promise<void> {
        const garage = await this.repo.getGarage(garageId);
        garage.parkingStatus.occupiedSpaces--;
        this.repo.updateGarage(garage)
    };

    async handleTicketPayment(ticketId: string): Promise<void> {
        const ticket = await this.repo.getTicket(ticketId);
        ticket.paymentTimestamp = new Date();
        await this.repo.updateTicket(ticket);
    };

    async mayExit(ticketId: string): Promise<boolean> {
        const ticket = await this.repo.getTicket(ticketId);
        // check if payment was more than 15 minutes ago
        const currentDate = new Date();
        const payDate = ticket.paymentTimestamp;
        if (payDate !== undefined || payDate !== null) {
            const isExceeded = (currentDate.getDate() - payDate.getDate()) == 0 &&
                (currentDate.getFullYear() - payDate.getFullYear()) == 0 &&
                currentDate.getTime() - payDate.getTime() <= 900000;
            return !isExceeded;
        } else {
            return false;
        }
    };

    async startChargingSession(garageId: string, stationId: string, userId: string): Promise<string> {
        const garage = await this.repo.getGarage(garageId);
        if (garage.isOpen) {
            const session: ChargingSession = {
                id: crypto.randomUUID(),
                userId: userId,
                garageId: garageId,
                chargingStationId: stationId,
                sessionStartedTimestamp: null,
                sessionFinishedTimestamp: null,
                kWhConsumed: null
            }
            this.repo.createChargingSession(session);
            return session.id;
        } else {
            throw Error('Cannot start charging session because garage is closed.');
        }
    };

    // define how the kWhConsumed are handled
    async endChargingSession(garageId: string, stationId: string): Promise<void> {

    };

    // maybe also change that to get session by id
    async getCurrentSession(garageId: string, stationId: string): Promise<ChargingSession> {
        return Promise.reject()
    };

    async getChargingInvoice(sessionId: string): Promise<ChargingInvoice> {
        return this.repo.getChargingInvoice(sessionId);
    };

    // async occupyChargingStation(garageId: string, stationId: string): Promise<void> {
    //     const data = readFileSync(garagesRepo, 'utf-8');
    //     const jsonData = JSON.parse(data);
    //     const index = jsonData.findIndex((garage: Garage) => garage.id === garageId);
    //     if (index !== -1) {
    //         const garage: Garage = jsonData[index];
    //         const stationIndex = garage.chargingStations
    //             .findIndex((station: ChargingStation) => station.id === stationId);
    //         if(stationIndex !== -1) {
    //             if (!garage.chargingStations[stationIndex].isOccupied) {
    //                 garage.chargingStations[stationIndex].isOccupied = true;
    //                 garage.chargingStatus.occupiedSpaces++;
    //             }
    //         }
    //         jsonData[index] = { ...jsonData[index], ...garage };
    //         writeFileSync(garagesRepo, JSON.stringify(jsonData), 'utf-8');
    //     }
    // }

    // async vacateChargingStation(garageId: string, stationId: string): Promise<void> {
    //     const data = readFileSync(garagesRepo, 'utf-8');
    //     const jsonData = JSON.parse(data);
    //     const index = jsonData.findIndex((garage: Garage) => garage.id === garageId);
    //     if (index !== -1) {
    //         const garage: Garage = jsonData[index];
    //         const stationIndex = garage.chargingStations
    //         .findIndex((station: ChargingStation) => station.id === stationId);
    //         if(stationIndex !== -1) {
    //             if (garage.chargingStations[stationIndex].isOccupied) {
    //                 garage.chargingStations[stationIndex].isOccupied = false;
    //                 garage.chargingStatus.occupiedSpaces--;
    //             }
    //         }
    //         jsonData[index] = { ...jsonData[index], ...garage };
    //         writeFileSync(garagesRepo, JSON.stringify(jsonData), 'utf-8');
    //     }
    // }

    // async endChargingSession(sessionId: string, timestamp: Date, kWhConsumed: number): Promise<void> {
    //     const data = readFileSync(chargingSessionsRepo, 'utf-8');
    //     const jsonData = JSON.parse(data);
    //     const index = jsonData.findIndex((session: ChargingSession) => session.id === sessionId);
    //     if (index !== -1) {
    //         const session: ChargingSession = jsonData[index];
    //         session.sessionFinishedTimestamp = timestamp;
    //         session.kWhConsumed = kWhConsumed;
    //         jsonData[index] = { ...jsonData[index], ...session };
    //         writeFileSync(chargingSessionsRepo, JSON.stringify(jsonData), 'utf-8');
    //     }
    // }

    private getGarageFromDto(garageDto: GarageDto): Garage {
        return new Garage(
            garageDto.id,
            garageDto.isOpen,
            new OccupancyStatus(
                garageDto.totalParkingSpaces, 0
            ),
            new OccupancyStatus(
                garageDto.totalChargingSpaces, 0
            ),
            garageDto.chargingStations
        );
    }
}