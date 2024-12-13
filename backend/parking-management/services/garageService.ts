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
        let garage = await this.repo.getGarage(garageId);
        const garageRollback = garage;
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
            garage = this.setChargingOccupancy(garage, garage.chargingStatus.occupiedSpaces+1);
            garage = this.setChargingStationOccupied(garage, stationId, true);
            await this.repo.updateGarage(garage).catch(() => {
                throw new Error(`Unable to update charging stations occupancy for garage ${garageId}`);
            })
            await this.repo.createChargingSession(session).catch(async () => {
                await this.repo.updateGarage(garageRollback);
                throw Error('Unable to create the charging session in the database');
            });

            return session.id;
        } else {
            throw Error('Cannot start charging session because garage is closed.');
        }
    };

    private setChargingOccupancy(garage: Garage, newValue: number): Garage {
        garage.chargingStatus.occupiedSpaces = newValue;

        if (garage.chargingStatus.occupiedSpaces > garage.chargingStatus.totalSpaces) {
            throw new Error('All charging stations are occupied already');
        } else {
            return garage;
        }
    }

    private setChargingStationOccupied(garage: Garage, stationId: string, occupied: boolean): Garage {
        let stationIndex = garage.chargingStations.findIndex(station => station.id == stationId)

        if (stationIndex !== -1) {
            if(garage.chargingStations[stationIndex].isOccupied == occupied) {
                throw Error(`Cannot change occupation for charging station with ID ${stationId} to same value`);
            } else {
                garage.chargingStations[stationIndex].isOccupied = occupied;
                return garage
            }
        } else {
            throw new Error(`Charging station with ID ${stationId} does not exist for garage with ID ${garage.id}`);
        }
    }

    async endChargingSession(garageId: string, sessionId: string): Promise<void> {
        let garage = await this.repo.getGarage(garageId);
        const garageRollback = garage;
        let session = await this.repo.getChargingSession(sessionId);

        if (session.sessionFinishedTimestamp) {
            throw new Error(`Session with ID ${sessionId} has already ended`);
        } else {
            session.sessionFinishedTimestamp = new Date();
            session.kWhConsumed = this.getConsumedKwhForSession(garage, session)
            garage = this.setChargingOccupancy(garage, garage.chargingStatus.occupiedSpaces -1);
            garage = this.setChargingStationOccupied(garage, session.chargingStationId, false);
            await this.repo.updateGarage(garage)
            await this.repo.updateChargingSession(session).catch(async () => {
                await this.repo.updateGarage(garageRollback);
                throw Error('Unable to create the charging session in the database');
            })
        }
    };

    private getConsumedKwhForSession(garage: Garage, session: ChargingSession): number {
        const station = garage.chargingStations.find(station => {station.id == session.chargingStationId});
        const chargedHours = (session.sessionFinishedTimestamp.getTime() - 
            session.sessionStartedTimestamp.getTime()) / (1000 * 60 * 60);
        return chargedHours * station.chargingSpeedInKw;

    }

    async getChargingInvoice(sessionId: string): Promise<ChargingInvoice> {
        return this.repo.getChargingInvoice(sessionId);
    };

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