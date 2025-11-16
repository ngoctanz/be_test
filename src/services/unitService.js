import { Unit } from "../models/unitModel.js";

class UnitService {
  async createUnit(data) {
    return await Unit.createUnit(data);
  }

  async getAllUnits() {
    return await Unit.findAllUnits();
  }

  async getUnitById(id) {
    return await Unit.findUnitById(id);
  }

  async getUnitByName(name) {
    return await Unit.findUnitByName(name);
  }

  async updateUnit(id, data) {
    return await Unit.updateUnit(id, data);
  }

  async hideUnit(id) {
    return await Unit.hideUnit(id);
  }

  async deleteUnit(id) {
    return await Unit.deleteUnit(id);
  }
}

export const unitService = new UnitService();
