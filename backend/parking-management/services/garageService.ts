import { Repository } from "../repositories/repository";

export class GarageService {
    private repo: Repository;

    constructor(repository: Repository) {
        this.repo = repository;
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

    handleCarEntry(garageId: string) {
        const isOpen = this.repo.getIsOpen(garageId);
        if (isOpen) {
            this.repo.increaseParkingOccupancy(garageId);
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

    // is the session created in the frontend? then change the endpoint and the methods
    startChargingSession(garageId: string, stationId: string, userId: string) {
        const isOpen = this.repo.getIsOpen(garageId);
        if (isOpen) { 

        } else {
            throw Error('Cannot start charging session because garage is closed.');
        }
    };

    // is the session created in the frontend? then change the endpoint and the methods
    endChargingSession(garageId: string, stationId: string) {

    };

    // maybe also change that to get session by id
    getCurrentSession(garageId: string, stationId: string) {};

    getChargingInvoice(sessionId: string) {
        this.repo.getChargingInvoice(sessionId);
    };
}