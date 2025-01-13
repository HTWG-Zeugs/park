import { Router } from "express";
import { GarageRepository } from "./GarageRepo";
import { Garage } from "./models/Garage";
import { GarageResponseObject } from "../../../../shared/GarageResponseObject";
import { GarageRequestObject } from "../../../../shared/GarageRequestObject";
import { ChargingStation } from "./models/ChargingStation";
import { ChargingStationResponseObject } from "../../../../shared/ChargingStationResponseObject";
import { CreateGarageResponseObject } from "../../../../shared/CreateGarageResponseObject";
import { firestore } from "./../firestore";
import validateFirebaseIdToken from "../middleware/validateFirebaseIdToken";
import { GarageEventsNotifier } from "./GarageEventsNotifier";
import jwt from "jsonwebtoken";

const router = Router();

const repository = new GarageRepository(firestore);
const notifier = new GarageEventsNotifier(process.env.PARKING_MANAGEMENT_BACKEND_URL);

router.get("/", validateFirebaseIdToken, (req, res) => {
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

router.post("/", validateFirebaseIdToken, async (req, res) => {
  const tenantId: string = getTenantId(req);
  const createGarageRequest = req.body as GarageRequestObject;
  const garage = toGarage(tenantId, createGarageRequest);

  try {
    await repository.addGarage(garage);
    await notifier.notifyGarageCreated(garage);
    res.status(201).send(
      {
        Id: garage.Id
      } as CreateGarageResponseObject
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

router.get("/:id", validateFirebaseIdToken, (req, res) => {
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


router.put("/:id", validateFirebaseIdToken, async (req, res) => {
  const id = req.params.id;
  const tenantId = getTenantId(req);
  const createGarageRequest = req.body as GarageRequestObject;
  const garage = toGarage(tenantId, createGarageRequest);

  const existingGarage = await repository.getGarage(id);
  existingGarage.update(garage);

  repository.updateGarage(existingGarage)
    .then(async () => {
      await notifier.notifyGarageUpdated(existingGarage);
      res.status(200).send("updated");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

router.delete("/:id", validateFirebaseIdToken, async (req, res) => {
  const id = req.params.id;

  try {
    await repository.deleteGarage(id);
    await notifier.notifyGarageDeleted(id);
    res.status(200).send("deleted");
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
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
    TenantId: garage.TenantId,
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

function toGarage(tenantId: string, garage: GarageRequestObject): Garage {
  const g = new Garage(tenantId, garage.name);
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

function getTenantId(req): string {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.split(" ")[1];
  const decodedToken = jwt.decode(token, { complete: true });
  const tenantId = (decodedToken.payload as jwt.JwtPayload).firebase?.tenant;
  return tenantId;
}

export default router;