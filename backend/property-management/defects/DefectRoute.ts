import { Router, Request, Response } from "express";
import { DefectController } from "./controllers/DefectController";
import { ObjectStorageRepo } from "./infrastructure/ObjectStorageRepo";
import { FirestoreDefectRepo } from "./infrastructure/FirestoreDefectRepo";
import validateFirebaseIdToken from "../middleware/validateFirebaseIdToken";
const router = Router();

const repository = new FirestoreDefectRepo();
const objectStorage = new ObjectStorageRepo();
const defectController = new DefectController(repository, objectStorage);

router.get("/", validateFirebaseIdToken, (req: Request, res: Response) => {
  defectController.getDefects(req, res);
});

router.get("/:id", validateFirebaseIdToken, (req: Request, res: Response) => {
  defectController.getDefectById(req, res);
});

router.post("/", validateFirebaseIdToken, (req: Request, res: Response) => {
  defectController.createDefect(req, res);
});

router.put("/:id", validateFirebaseIdToken, (req: Request, res: Response) => {
  defectController.updateDefect(req, res);
});

router.delete(
  "/:id",
  validateFirebaseIdToken,
  (req: Request, res: Response) => {
    defectController.deleteDefect(req, res);
  }
);

router.get(
  "/signedUrl/:image",
  validateFirebaseIdToken,
  async (req: Request, res: Response) => {
    await defectController.getSignedUrlForImage(req, res);
  }
);

router.get(
  "/signedUploadUrl/:image",
  validateFirebaseIdToken,
  async (req: Request, res: Response) => {
    await defectController.getSignedUploadUrlsForImage(req, res);
  }
);

export default router;
