import { Defect } from "./defectAggregate/Defect";

export interface IDefectRepo {
  addDefect(defect: Defect): Promise<void>;
  updateDefect(defect: Defect): Promise<boolean>;
  getDefect(defectId: string): Promise<Defect>;
  getAllDefects(): Promise<Defect[]>;
  deleteDefect(defectId: string): Promise<void>;
}
