import { Router } from "express";
import validateFirebaseIdToken from "../middleware/validateFirebaseIdToken";
import { GarageRepository } from "./GarageRepo";
import { Garage } from "./models/Garage";
import { GarageResponseObject } from "../../../../shared/GarageResponseObject";
import { CreateGarageRequestObject } from "../../../../shared/CreateGarageRequestObject";

const router = Router();

const repository = new GarageRepository();

router.get("/", validateFirebaseIdToken, (req, res) => {
  repository.getAllGarages()
    .then((garages) => {
      const responseGarages = garages.map((g) => toGetGarageResponse(g));
      res.status(200).send(responseGarages);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
});

router.post("/", validateFirebaseIdToken, (req, res) => {
  const createGarageRequest = req.body as CreateGarageRequestObject;
  const garage = toGarage(createGarageRequest);
  repository.addGarage(garage)
    .then(() => {
      // publish event to parking management service
      
      res.status(201).send("created");
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
});

function toGetGarageResponse(garage: Garage): GarageResponseObject {
  return {
    Id: garage.Id,
    Name: garage.Name,
    IsOpen: garage.IsOpen,
    NumberParkingSpots: garage.NumberParkingSpots,
    PricePerHourInEuros: garage.PricePerHourInEuros,
    OpeningTime: garage.OpeningTime.toISOString(),
    ClosingTime: garage.ClosingTime.toISOString(),
    CreatedAt: garage.CreatedAt.toISOString(),
    LastModifiedAt: garage.LastModifiedAt.toISOString(),
  };
}

function toGarage(garage: CreateGarageRequestObject): Garage {
  const g = new Garage(garage.Name);
  g.setNumberParkingSpots(garage.NumberParkingSpots);
  g.setPricePerHourInEuros(garage.PricePerHourInEuros);
  g.setOpeningTimes(garage.OpeningTime, garage.ClosingTime);
  return g;
}