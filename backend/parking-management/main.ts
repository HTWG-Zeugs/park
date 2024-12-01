import { JsonFileRepository } from "./repositories/jsonFileRepository";
import { Repository } from "./repositories/repository";
import { GarageService } from "./services/garageService";

const express = require('express');
const app = express();
const port = 8081;

app.use(express.json());

const repo: Repository = new JsonFileRepository();
const garageService: GarageService = new GarageService(repo);

app.get('/garage/parking/occupancy/:garageId', (req, res) => {
    try {
        const garageId = req.params.garageId;
        const occupancy = garageService.getParkingOccupancy(garageId);
        res.status(200).send(occupancy);
    } catch (e) {
        res.status(500).send("Getting parking occupancy failed: " + e);
    }
});

app.post('/garage/enter/:garageId', (req, res) => {
    try {
        const garageId = req.params.garageId;
        garageService.handleCarEntry(garageId);
        res.status(200).send('success');
    } catch (e) {
        res.status(500).send('Handling car entry failed: ' + e);
    }
});

app.post('/garage/exit/:garageId', (req, res) => {
    try {
        const garageId = req.params.garageId;
        garageService.handleCarExit(garageId);
        res.status(200).send('success');
    } catch (e) {
        res.status(500).send('Handling car exit failed: ' + e);
    }
});

app.post('/garage/handlePayment/:ticketId', (req, res) => {
    try {
        const ticketId = req.params.ticketId;
        garageService.handleTicketPayment(ticketId);
        res.status(200).send('success')
    } catch (e) {
        res.status(500).send('Handling ticket payment failed: ' + e);
    }
})

app.get('/garage/mayExit/:ticketId', (req, res) => {
    try {
        const ticketId = req.params.ticketId;
        const mayExit = garageService.mayExit(ticketId);
        res.status(200).send(mayExit);
    } catch (e) {
        res.status(500).send("Retrieving exit permission failed: " + e);
    }
});

app.get('/garage/charging/occupancy/:garageId', (req, res) => {
    try {
        const garageId = req.params.garageId;
        const occupancy = garageService.getChargingOccupancy(garageId);
        res.status(200).send(occupancy);
    } catch (e) {
        res.status(500).send("Getting charging occupancy failed: " + e);
    }
});

//discuss the charging session endpoints with the team
app.post('/garage/charging/startSession/:garageId/:stationId', (req, res) => {
    const garageId = req.params.garageId;
    const stationId = req.params.stationId;
    const userId = req.body;
    // start charging session at an e-charging station
    res.status(200).send('POST charging/startSession');
});

app.post('/garage/charging/endSession/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    // end charging session at an e-charging station
    res.status(200).send('POST charging/endSession');
});

app.get('/garage/charging/session/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    // get session information for analytics (duration, user ID, session ID ...)
    res.status(200).send('GET charging/session');
});

app.get('/garage/charging/invoice/:sessionId', (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const invoice = garageService.getChargingInvoice(sessionId);
        res.status(200).send(invoice);
    } catch (e) {
        res.status(500).send('Getting charging invoice failed: ' + e);
    }
});

app.listen(port, () => {
    console.log(`parking management service listening on port ${port}`);
});