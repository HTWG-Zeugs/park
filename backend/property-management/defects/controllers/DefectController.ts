import { CreateDefectRequestObject } from "../../../../shared/CreateDefectRequestObject";
import { DefectResponseObject } from "../../../../shared/DefectResponseObject";
import { CreateDefectResponseObject } from "../../../../shared/CreateDefectResponseObject";
import { UpdateDefectRequestObject } from "../../../../shared/UpdateDefectRequestObject";
import type { ObjectStorageRepo } from "../infrastructure/ObjectStorageRepo";
import { Defect } from "../models/defectAggregate/Defect";
import { DefectReportStatus } from "../models/defectAggregate/DefectReportStatus";
import { IDefectRepo } from "../models/IDefectRepo";
import { Request, Response } from "express";

export class DefectController {
  private Repository: IDefectRepo;
  private objectStorage: ObjectStorageRepo;

  constructor(repo: IDefectRepo, objectStorage: ObjectStorageRepo) {
    this.Repository = repo;
    this.objectStorage = objectStorage;
  }

  createDefect = (req: Request, res: Response) => {
    const defect: Defect = toDefect(req.body);

    const allImagesUploaded = checkUploadedImages(
      defect.ImageNames,
      this.objectStorage
    );

    if (!allImagesUploaded) {
      res.status(400).send("Not all images uploaded");
      return;
    }

    this.Repository.addDefect(defect)
      .then(() => {
        const response = toCreateDefectResponse(defect);
        res.status(200).send(response);
      })
      .catch(() => {
        res
          .status(500)
          .send(
            "Unable to create defect from body: " + JSON.stringify(req.body)
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
  const status: DefectReportStatus =
    DefectReportStatus[request.Status as keyof typeof DefectReportStatus];

  const defect: Defect = new Defect(request.Object, request.Location, status);

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
