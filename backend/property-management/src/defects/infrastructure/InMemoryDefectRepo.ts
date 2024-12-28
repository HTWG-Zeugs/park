import { IDefectRepo } from "../models/IDefectRepo";
import { Defect } from "../models/defectAggregate/Defect";

export class InMemoryDefectRepo implements IDefectRepo {
  defects: Defect[] = [];

  getAllDefects(): Promise<Defect[]> {
    return Promise.resolve(this.defects);
  }

  addDefect(defect: Defect): Promise<void> {
    this.defects.push(defect);
    return Promise.resolve();
  }

  updateDefect(defect: Defect): Promise<boolean> {
    const index = this.defects.findIndex((d) => d.Id == defect.Id);
    if (index != -1) {
      this.defects[index] = defect;
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  getDefect(defectId: string): Promise<Defect> {
    const defect = this.defects.find((s) => s.Id == defectId);
    if (defect) {
      return Promise.resolve(defect);
    }
    return Promise.reject(new Error("Defect not found"));
  }

  deleteDefect(defectId: string): Promise<void> {
    this.defects = this.defects.filter((d) => d.Id != defectId);
    return Promise.resolve();
  }
}
