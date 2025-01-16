import { CreateDefectRequestObject } from "../../../../../shared/CreateDefectRequestObject";
import { DefectResponseObject } from "../../../../../shared/DefectResponseObject";
import { CreateDefectResponseObject } from "../../../../../shared/CreateDefectResponseObject";
import { UpdateDefectRequestObject } from "../../../../../shared/UpdateDefectRequestObject";
import { DefectStatusRecord } from "../../../../../shared/DefectStatusRecord"
import type { ObjectStorageRepo } from "../infrastructure/ObjectStorageRepo";
import { Defect } from "../models/defectAggregate/Defect";
import { DefectReportStatus } from "../models/defectAggregate/DefectReportStatus";
import { IDefectRepo } from "../models/IDefectRepo";
import { Request, Response } from "express";
import { getIdToken } from "../../middleware/ServiceCommunication";
import axios, { AxiosResponse } from "axios";
import { GarageRepository } from "../../garages/GarageRepo";
import { firestore } from "../../firestore";

export class DefectController {
  private Repository: IDefectRepo;
  private garageRepo = new GarageRepository(firestore);
  private objectStorage: ObjectStorageRepo;

  constructor(repo: IDefectRepo, objectStorage: ObjectStorageRepo) {
    this.Repository = repo;
    this.objectStorage = objectStorage;
  }

  createDefect = async (req: Request, res: Response) => {
    const defect: Defect = toDefect(req.body);

    const allImagesUploaded = checkUploadedImages(
      defect.ImageNames,
      this.objectStorage
    );

    if (!allImagesUploaded) {
      res.status(400).send("Not all images uploaded");
      return;
    }
    
    const garage = await this.garageRepo.getGarage(defect.GarageId);
    const currentDefectStatus = await getRecentDefectStatus(garage.TenantId, garage.Id);
    notifyAnalytics(garage.TenantId, garage.Id, 'defects/status', {
      timestamp: new Date(),
      open: currentDefectStatus.open + 1,
      closed: currentDefectStatus.closed,
      inWork: currentDefectStatus.inWork,
      rejected: currentDefectStatus.rejected
    } as DefectStatusRecord)

    this.Repository.addDefect(defect)
      .then(async () => {
        const response = toCreateDefectResponse(defect);
        res.status(200).send(response);
      })
      .catch((e) => {
        res
          .status(500)
          .send(
            `Unable to create defect from body: " + ${JSON.stringify(req.body)}, ${e}`
          );
      });
  };

  async updateDefect(req: Request, res: Response) {
    const id = req.params.id;
    let defect: Defect;
    try {
      defect = await this.Repository.getDefect(id);
    } catch (error) {
      res.status(404).send(`Unable to find Defect with id ${id}.`);
      return;
    }

    const request = req.body as UpdateDefectRequestObject;
    const status: DefectReportStatus =
      DefectReportStatus[request.Status as keyof typeof DefectReportStatus];

    const garage = await this.garageRepo.getGarage(defect.GarageId);
    const currentDefectStatus = await getRecentDefectStatus(garage.TenantId, garage.Id);
    let defectStatusRecord: DefectStatusRecord = currentDefectStatus;
    defectStatusRecord.timestamp = new Date();

    if (defect.Status === DefectReportStatus.Open) {
      defectStatusRecord.open--;
    } else if (defect.Status === DefectReportStatus.Closed) {
      defectStatusRecord.closed--;
    } else if (defect.Status === DefectReportStatus.InWork) {
      defectStatusRecord.inWork--;
    } else if (defect.Status === DefectReportStatus.Rejected) {
      defectStatusRecord.rejected--;
    } 

    if (status === DefectReportStatus.Open) {
      defectStatusRecord.open++;
    } else if (status === DefectReportStatus.Closed) {
      defectStatusRecord.closed++;
    } else if (status === DefectReportStatus.InWork) {
      defectStatusRecord.inWork++;
    } else if (status === DefectReportStatus.Rejected) {
      defectStatusRecord.rejected++;
    } 

    notifyAnalytics(garage.TenantId, garage.Id, 'defects/status', defectStatusRecord)

    defect.setStatus(status);
    try {
      const updated = await this.Repository.updateDefect(defect);
      if (updated) {
        res.status(200).send("updated");
      } else {
        res.status(500).send("Unable to update defect");
      }
    } catch {
      res.status(500).send("Unable to update defect");
    }
  }

  deleteDefect = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
      const defect = await this.Repository.getDefect(id);
      if (!defect) {
        res.status(200).send("deleted");
        return;
      }

      await this.Repository.deleteDefect(id);

      const garage = await this.garageRepo.getGarage(defect.GarageId);
      const currentDefectStatus = await getRecentDefectStatus(garage.TenantId, garage.Id);
      let defectStatusRecord: DefectStatusRecord = currentDefectStatus;
      defectStatusRecord.timestamp = new Date();

      if (defect.Status === DefectReportStatus.Open) {
        defectStatusRecord.open--;
      } else if (defect.Status === DefectReportStatus.Closed) {
        defectStatusRecord.closed--;
      } else if (defect.Status === DefectReportStatus.InWork) {
        defectStatusRecord.inWork--;
      } else if (defect.Status === DefectReportStatus.Rejected) {
        defectStatusRecord.rejected--;
      }

      notifyAnalytics(garage.TenantId, garage.Id, 'defects/status', defectStatusRecord)

      await Promise.all(
        defect.ImageNames.map((imageName) =>
          this.objectStorage.deleteImage(imageName)
        )
      );
      res.status(200).send("deleted");
    } catch {
      res.status(500).send("Unable to delete defect");
    }
  };

  getDefects = (_: Request, res: Response) => {
    this.Repository.getAllDefects()
      .then((defects) => {
        const responseDefects = defects.map((d) => toGetDefectResponse(d));
        res.status(200).send(responseDefects);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json(error);
      });
  };

  getDefectById = (req: Request, res: Response) => {
    const id = req.params.id;

    this.Repository.getDefect(id)
      .then((defect) => {
        if (defect == undefined) {
          res.status(400).send(`Unable to find Defect with id ${id}.`);
          return;
        }
        const responseDefect = toGetDefectResponse(defect);
        res.status(200).send(responseDefect);
      })
      .catch(() => {
        res.status(500).send("Unable to get defect with ID: " + id);
      });
  };

  getSignedUrlForImage = async (req: Request, res: Response) => {
    const imageName = req.params.image;
    try {
      const result = await this.objectStorage.getSignedUrl(imageName);
      res.json(result);
    } catch (e) {
      res
        .status(500)
        .json(`Unable to get signed display URL for image ${imageName}: ${e}`);
    }
  };

  getSignedUploadUrlsForImage = async (_req: Request, res: Response) => {
    const imageName = crypto.randomUUID();
    try {
      const signedUploadUrl =
        await this.objectStorage.getSignedUploadUrl(imageName);
      const signedDeleteUrl =
        await this.objectStorage.getSignedDeleteUrl(imageName);
      res.json({
        name: imageName,
        uploadUrl: signedUploadUrl[0],
        deleteUrl: signedDeleteUrl[0],
      });
    } catch (e) {
      res
        .status(500)
        .json(`Unable to get signed upload URL for image ${imageName}: ${e}`);
    }
  };
}

function toDefect(request: CreateDefectRequestObject): Defect {
  const defect: Defect = new Defect(request.Object, request.Location, request.GarageId);

  defect.ShortDesc = request.ShortDesc;
  defect.DetailedDesc = request.DetailedDesc;
  request.ImageNames.forEach((name) => defect.addImage(name));
  return defect;
}

function toCreateDefectResponse(defect: Defect): CreateDefectResponseObject {
  const response: CreateDefectResponseObject = {
    Id: defect.Id,
  };
  return response;
}

function toGetDefectResponse(defect: Defect): DefectResponseObject {
  const response: DefectResponseObject = {
    Id: defect.Id,
    GarageId: defect.GarageId,
    Object: defect.Object,
    Location: defect.Location,
    ShortDesc: defect.ShortDesc ?? "",
    DetailedDesc: defect.DetailedDesc ?? "",
    ReportingDate: defect.ReportingDate.toISOString(),
    Status: DefectReportStatus[defect.Status],
    ImageNames: [...defect.ImageNames],
    LastModifiedAt: defect.LastModifiedAt.toISOString(),
  };

  return response;
}

function checkUploadedImages(
  ImageNames: readonly string[],
  objectStorage: ObjectStorageRepo
) {
  for (const imageName of ImageNames) {
    const exists = objectStorage.checkImageExists(imageName);
    if (!exists) {
      return false;
    }
  }
  return true;
}

async function notifyAnalytics(tenantId: string, garageId: string, endpoint: string, record: any) {
  try {
    const token = await getIdToken();
    let response: AxiosResponse;
    let route: string;
    let body: any;

    if (typeof record === "number") {
      route = `${process.env.INFRASTRUCTURE_MANAGEMENT_SERVICE_URL}/analytics/${endpoint}/${tenantId}/${garageId}/${record}`;
      body = {}
    } else {
      route = `${process.env.INFRASTRUCTURE_MANAGEMENT_SERVICE_URL}/analytics/${endpoint}/${tenantId}/${garageId}`;
      body = record;
    }
    
    response = await axios.put(route, body, { headers: { Authorization: `Bearer ${token}` } });

    if (response.status !== 200) {
      throw new Error(`API request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Error calling API:', error);
  }
}

async function getRecentDefectStatus(tenantId: string, garageId: string): Promise<DefectStatusRecord> {
  const token = await getIdToken();
    let response: AxiosResponse;

    response = await axios.post(
      `${process.env.INFRASTRUCTURE_MANAGEMENT_SERVICE_URL}/analytics/defects/status/${tenantId}/${garageId}/${new Date()}`,
      {}, 
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status !== 200) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.data as DefectStatusRecord
}
