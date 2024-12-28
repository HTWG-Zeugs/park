import { Router } from "express";
import validateFirebaseIdToken from "../middleware/validateFirebaseIdToken";
import { GarageRepository } from "./GarageRepo";
import { Garage } from "./models/Garage";
import { GarageResponseObject } from "../../../../shared/GarageResponseObject";
import { GarageRequestObject } from "../../../../shared/GarageRequestObject";
import { ChargingStation } from "./models/ChargingStation";
import { ChargingStationResponseObject } from "../../../../shared/ChargingStationResponseObject";
import { CreateGarageResponseObject } from "../../../../shared/CreateGarageResponseObject";
import { firestore } from "./../firestore";
import { GarageEventsNotifier } from "./GarageEventsNotifier";

const router = Router();

const repository = new GarageRepository(firestore);
const notifier = new GarageEventsNotifier(process.env.PARKING_MANAGEMENT_BACKEND_URL);

router.get("/", (req, res) => {
  repository.getAllGarages()
    .then((garages) => {
      const responseGarages = garages.map((g) => toGetGarageResponse(g));
      res.status(200).send(responseGarages);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

router.post("/", (req, res) => {
  const createGarageRequest = req.body as GarageRequestObject;
  const garage = toGarage(createGarageRequest);
  repository.addGarage(garage)
    .then(() => {
      notifier.notifyGarageCreated(garage);
      res.status(201).send(
        {
          Id: garage.Id
        } as CreateGarageResponseObject
      );
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  repository.getGarage(id)
    .then((garage) => {
      if (garage) {
        res.status(200).send(toGetGarageResponse(garage));
      } else {
        res.status(404).send("not found");
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});


router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const createGarageRequest = req.body as GarageRequestObject;
  const garage = toGarage(createGarageRequest);

  const existingGarage = await repository.getGarage(id);
  existingGarage.update(garage);

  repository.updateGarage(existingGarage)
    .then(() => {
      notifier.notifyGarageUpdated(existingGarage);
      res.status(200).send("updated");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  repository.deleteGarage(id)
    .then(() => {
      notifier.notifyGarageDeleted(id);
      res.status(200).send("deleted");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});


function toGetGarageResponse(garage: Garage): GarageResponseObject {
  const chargingStations : ChargingStationResponseObject[] = garage.ChargingStations.map((cs) => {
    return {
      id: cs.Id,
      name: cs.Name,
      chargingSpeedInKw: cs.ChargingSpeedInKw,
      pricePerKwh: cs.PricePerKwh
    }
  });

  return {
    Id: garage.Id,
    Name: garage.Name,
    IsOpen: garage.IsOpen,
    NumberParkingSpots: garage.NumberParkingSpots,
    PricePerHourInEuros: garage.PricePerHour,
    OpeningTime: garage.OpeningTime,
    ClosingTime: garage.ClosingTime,
    CreatedAt: garage.CreatedAt.toISOString(),
    LastModifiedAt: garage.LastModifiedAt.toISOString(),
    ChargingStations: chargingStations
  };
}

function toGarage(garage: GarageRequestObject): Garage {
  const g = new Garage(garage.name);
  g.setNumberParkingSpots(garage.numberParkingSpots);
  g.setPricePerHourInEuros(garage.pricePerHourInEuros);
  g.setOpeningTimes(garage.openingTime, garage.closingTime);
  g.IsOpen = garage.isOpen;

  const chargingStations = garage.chargingStations.map((cs) => {
    return new ChargingStation(cs.name, cs.chargingSpeedInKw, cs.pricePerKwh);
  });

  g.setChargingStations(chargingStations);
  return g;
}

export default router;