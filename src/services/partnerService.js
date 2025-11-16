import { Partner } from "../models/partnerModel.js";

class PartnerService {
  async createPartner(data) {
    return await Partner.createPartner(data);
  }

  async getAllPartners() {
    return await Partner.findAllPartners();
  }

  async getPartnerById(id) {
    return await Partner.findPartnerById(id);
  }

  async getPartnerByName(name) {
    return await Partner.findPartnerByName(name);
  }

  async updatePartner(id, data) {
    return await Partner.updatePartner(id, data);
  }

  async hidePartner(id) {
    return await Partner.hidePartner(id);
  }

  async deletePartner(id) {
    return await Partner.deletePartner(id);
  }
}

export const partnerService = new PartnerService();
