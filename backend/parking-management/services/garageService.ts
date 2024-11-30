
export class GarageService {
    getParkingOccupancy(garageId: string) {}
    getChargingOccupancy(garageId: string) {};
    handleCarEntry(garageId: string) {}
    handleCarExit(garageId: string) {}
    handleTicketPayment(ticketId: string) {}
    mayExit(ticketId: string) {}
    startChargingSession(garageId: string, stationId: string, userId: string) {}
    endChargingSession(garageId: string, stationId: string) {}
    getCurrentSession(garageId: string, stationId: string) {}
    getChargingInvoice(sessionId: string) {}
}