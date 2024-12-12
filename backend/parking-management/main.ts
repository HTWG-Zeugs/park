import { GarageDto } from "../shared/garageDto";
import { JsonFileRepository } from "./repositories/jsonFileRepository";
import { Repository } from "./repositories/repository";
import { GarageService } from "./services/garageService";
import "dotenv/config"

console.log(process.env.ASDF);

const express = require('express');
const app = express();
const port = 8081;

app.use(express.json());

const repo: Repository = new JsonFileRepository();
const garageService: GarageService = new GarageService(repo);

app.put('/garage/create', async (req, res) => {
    try {
        const garageDto: GarageDto = req.body;
        await garageService.createGarage(garageDto)
        res.status(200).send('success');
    } catch (e) {
        res.status(500).send("creating garage failed: " + e)
    }
})

app.put('/garage/update', async (req, res) => {
    try {
        const garageDto: GarageDto = req.body;
        await garageService.updateGarage(garageDto)
        res.status(200).send('success')
    } catch (e) {
        res.status(500).send("updating garage failed: " + e)
    }
})

app.get('/garage/parking/occupancy/:garageId', async (req, res) => {
    try {
        const garageId: string = req.params.garageId;
        const occupancy = await garageService.getParkingOccupancy(garageId);
        res.status(200).send(occupancy);
    } catch (e) {
        res.status(500).send("Getting parking occupancy failed: " + e);
    }
});

app.post('/garage/enter/:garageId', async (req, res) => {
    try {
        const garageId: string = req.params.garageId;
        const ticketId = await garageService.handleCarEntry(garageId);
        res.status(200).send(ticketId);
    } catch (e) {
        res.status(500).send('Handling car entry failed: ' + e);
    }
});

app.post('/garage/exit/:garageId', async (req, res) => {
    try {
        const garageId: string = req.params.garageId;
        await garageService.handleCarExit(garageId);
        res.status(200).send('success');
    } catch (e) {
        res.status(500).send('Handling car exit failed: ' + e);
    }
});

app.post('/garage/handlePayment/:ticketId', async (req, res) => {
    try {
        const ticketId: string = req.params.ticketId;
        await garageService.handleTicketPayment(ticketId);
        res.status(200).send('success')
    } catch (e) {
        res.status(500).send('Handling ticket payment failed: ' + e);
    }
})

app.get('/garage/mayExit/:ticketId', async (req, res) => {
    try {
        const ticketId: string = req.params.ticketId;
        const mayExit = await garageService.mayExit(ticketId);
        res.status(200).send(mayExit);
    } catch (e) {
        res.status(500).send("Retrieving exit permission failed: " + e);
    }
});

app.get('/garage/charging/occupancy/:garageId', async (req, res) => {
    try {
        const garageId: string = req.params.garageId;
        const occupancy = await garageService.getChargingOccupancy(garageId);
        res.status(200).send(occupancy);
    } catch (e) {
        res.status(500).send("Getting charging occupancy failed: " + e);
    }
});

//discuss the charging session endpoints with the team
//create session here and return id
app.post('/garage/charging/startSession/:garageId/:stationId', async (req, res) => {
    try {
        const garageId: string = req.params.garageId;
        const stationId: string = req.params.stationId;
        const userId: string = req.body;
        const sessionId = await garageService.startChargingSession(garageId, stationId, userId);
        res.status(200).send(sessionId);
    } catch (e) {
        res.status(500).send("Starting charging session failed: " + e);
    }
});

app.post('/garage/charging/endSession/:sessionId', async (req, res) => {
    const sessionId = req.params.sessionId;
    // end charging session at an e-charging station
    res.status(200).send('POST end session');
});

app.get('/garage/charging/session/:sessionId', async (req, res) => {
    const sessionId = req.params.sessionId;
    // get session information for analytics (duration, user ID, session ID ...)
    res.status(200).send('GET get session');
});

app.get('/garage/charging/invoice/:sessionId', async (req, res) => {
    try {
        const sessionId: string = req.params.sessionId;
        const invoice = await garageService.getChargingInvoice(sessionId);
        res.status(200).send(invoice);
    } catch (e) {
        res.status(500).send('Getting charging invoice failed: ' + e);
    }
});

app.listen(port, () => {
    console.log(`parking management service listening on port ${port}`);
});