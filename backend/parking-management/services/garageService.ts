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
        const garage = this.getGarageFromDto(garageDto);
        await this.repo.createGarage(garage);
    }

    async updateGarage(garageDto: GarageDto): Promise<void>  {
        const garage = this.getGarageFromDto(garageDto);
        this.repo.updateGarage(garage);
    }

    async getIsOpen(garageId: string): Promise<boolean> {
        return this.repo.getIsOpen(garageId)
    }

    async getParkingOccupancy(garageId: string): Promise<OccupancyStatus> {
        return this.repo.getParkingOccupancy(garageId);
    };

    async getChargingOccupancy(garageId: string): Promise<OccupancyStatus> {
        return this.repo.getChargingOccupancy(garageId);
    };

    async handleCarEntry(garageId: string): Promise<string> {
        const isOpen = await this.repo.getIsOpen(garageId);
        if (isOpen) {
            const ticket: Ticket = {
                id: crypto.randomUUID(),
                garageId: garageId,
                entryTimestamp: new Date(),
                paymentTimestamp: null
            };
            this.repo.createTicket(ticket);
            this.repo.increaseParkingOccupancy(garageId);
            return ticket.id;
        } else {
            throw Error('Cannot enter because garage is closed.');
        }
    };

    async handleCarExit(garageId: string): Promise<void> {
        this.repo.decreaseParkingOccupancy(garageId);
    };

    async handleTicketPayment(ticketId: string): Promise<void> {
        this.repo.addPaymentTimestamp(ticketId, new Date());
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
        const isOpen = await this.repo.getIsOpen(garageId);
        if (isOpen) {
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