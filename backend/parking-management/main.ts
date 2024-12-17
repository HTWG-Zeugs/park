import { GarageDto } from "../shared/garageDto";
import { FirestoreRepository } from "./repositories/firestoreRepository";
import { Repository } from "./repositories/repository";
import { GarageService } from "./services/garageService";
import cors from "cors";
import "dotenv/config";

const express = require("express");
const app = express();
const port = process.env.PORT ?? 8080;

app.use(cors());
app.use(express.json());

const repo: Repository = new FirestoreRepository();
const garageService: GarageService = new GarageService(repo);

app.post("/garage/create", async (req, res) => {
  try {
    const garageDto: GarageDto = req.body;
    await garageService.createGarage(garageDto);
    res.status(200).send("success");
  } catch (e) {
    res.status(500).send("creating garage failed: " + e);
  }
});

app.put("/garage/update", async (req, res) => {
  try {
    const garageDto: GarageDto = req.body;
    await garageService.updateGarage(garageDto);
    res.status(200).send("success");
  } catch (e) {
    res.status(500).send("updating garage failed: " + e);
  }
});

app.delete("/garage/delete/:garageId", async (req, res) => {
  try {
    const garageId: string = req.params.garageId;
    await garageService.deleteGarage(garageId);
    res.status(200).send("deleted");
  } catch (e) {
    res.status(500).send("deleting garage failed: " + e);
  }
});

app.get("/garage/parking/occupancy/:garageId", async (req, res) => {
  try {
    const garageId: string = req.params.garageId;
    const occupancy = await garageService.getParkingOccupancy(garageId);
    res.status(200).send(occupancy);
  } catch (e) {
    res.status(500).send("Getting parking occupancy failed: " + e);
  }
});

app.post("/garage/enter/:garageId", async (req, res) => {
  try {
    const garageId: string = req.params.garageId;
    const ticketId = await garageService.handleCarEntry(garageId);
    res.status(200).send(ticketId);
  } catch (e) {
    res.status(500).send("Handling car entry failed: " + e);
  }
});

app.post("/garage/exit/:garageId", async (req, res) => {
  try {
    const garageId: string = req.params.garageId;
    await garageService.handleCarExit(garageId);
    res.status(200).send("success");
  } catch (e) {
    res.status(500).send("Handling car exit failed: " + e);
  }
});

app.post("/garage/handlePayment/:ticketId", async (req, res) => {
  try {
    const ticketId: string = req.params.ticketId;
    await garageService.handleTicketPayment(ticketId);
    res.status(200).send("success");
  } catch (e) {
    res.status(500).send("Handling ticket payment failed: " + e);
  }
});

app.get("/garage/mayExit/:ticketId", async (req, res) => {
  try {
    const ticketId: string = req.params.ticketId;
    const mayExit = await garageService.mayExit(ticketId);
    res.status(200).send(mayExit);
  } catch (e) {
    res.status(500).send("Retrieving exit permission failed: " + e);
  }
});

app.get("/garage/charging/occupancy/:garageId", async (req, res) => {
  try {
    const garageId: string = req.params.garageId;
    const occupancy = await garageService.getChargingOccupancy(garageId);
    res.status(200).send(occupancy);
  } catch (e) {
    res.status(500).send("Getting charging occupancy failed: " + e);
  }
});

app.post(
  "/garage/charging/startSession/:garageId/:stationId/:userId",
  async (req, res) => {
    try {
      const garageId: string = req.params.garageId;
      const stationId: string = req.params.stationId;
      const userId: string = req.params.userId;
      const sessionId = await garageService.startChargingSession(
        garageId,
        stationId,
        userId
      );
      res.status(200).send(sessionId);
    } catch (e) {
      res.status(500).send("Starting charging session failed: " + e);
    }
  }
);

app.post(
  "/garage/charging/endSession/:garageId/:sessionId",
  async (req, res) => {
    try {
      const garageId = req.params.garageId;
      const sessionId = req.params.sessionId;
      await garageService.endChargingSession(garageId, sessionId);
      res.status(200).send("success");
    } catch (e) {
      res.status(500).send(`Unable to end session with id ${req.params.sessionId}: ${e}`);
    }
  }
);

app.get("/garage/charging/session/:sessionId", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const session = await garageService.getChargingSession(sessionId);
    res.status(200).send(session);
  } catch (e) {
    res.status(500).send(`Getting session with id ${req.params.sessionId} failed: ${e}`);
  }
});

app.get("/garage/charging/invoice/:sessionId", async (req, res) => {
  try {
    const sessionId: string = req.params.sessionId;
    const invoice = await garageService.getChargingInvoice(sessionId);
    res.status(200).send(invoice);
  } catch (e) {
    res.status(500).send("Getting charging invoice failed: " + e);
  }
});

app.listen(port, () => {
  console.log(`parking management service listening on port ${port}`);
});
