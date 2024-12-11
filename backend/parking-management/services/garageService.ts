import { GarageDto } from "../../shared/garageDto";
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

    createGarage(garageDto: GarageDto) {
        const garage = this.getGarageFromDto(garageDto);
        this.repo.createGarage(garage);
    }

    updateGarage(garageDto: GarageDto) {
        const garage = this.getGarageFromDto(garageDto);
        this.repo.updateGarage(garage);
    }

    getIsOpen(garageId: string) {
        return this.repo.getIsOpen(garageId);
    }

    getParkingOccupancy(garageId: string) {
        return this.repo.getParkingOccupancy(garageId);
    };

    getChargingOccupancy(garageId: string) {
        return this.repo.getChargingOccupancy(garageId);
    };

    handleCarEntry(garageId: string): string {
        const isOpen = this.repo.getIsOpen(garageId);
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

    handleCarExit(garageId: string) {
        this.repo.decreaseParkingOccupancy(garageId);
    };

    handleTicketPayment(ticketId: string) {
        this.repo.addPaymentTimestamp(ticketId, new Date());
    };

    mayExit(ticketId: string) {
        const ticket = this.repo.getTicket(ticketId);
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

    startChargingSession(garageId: string, stationId: string, userId: string): string {
        const isOpen = this.repo.getIsOpen(garageId);
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
    endChargingSession(garageId: string, stationId: string) {

    };

    // maybe also change that to get session by id
    getCurrentSession(garageId: string, stationId: string) {
        
    };

    getChargingInvoice(sessionId: string) {
        this.repo.getChargingInvoice(sessionId);
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