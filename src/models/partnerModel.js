import mongoose, { Schema } from "mongoose";

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: Schema.Types.String,
      required: [true, "partner name is required!"],
      trim: true,
      unique: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

partnerSchema.index({ createdAt: -1 });

// Instance method
partnerSchema.methods.toJSON = function () {
  const partnerObject = this.toObject();
  delete partnerObject.isDeleted;
  delete partnerObject.deletedAt;
  return partnerObject;
};

// Static methods
partnerSchema.statics = {
  async createPartner(data) {
    const partner = new this(data);
    await partner.save();
    return partner;
  },
  async findPartnerById(id) {
    const partner = await this.findById(id).lean();
    if (!partner) {
      throw new Error("Partner not found");
    }
    return partner;
  },
  async findAllPartners() {
    return this.find().lean();
  },
  async findPartnerByName(name) {
    return this.findOne({ name: new RegExp(name, "i") }).lean();
  },
  async updatePartner(id, data) {
    const partner = await this.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!partner) {
      throw new Error("Partner not found!");
    }
    return partner;
  },
  async hidePartner(id) {
    const updatedPartner = await this.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!updatedPartner) throw new Error("Partner not found!");
    return updatedPartner;
  },
  async deletePartner(id) {
    return this.findByIdAndDelete(id);
  },
};

export const Partner = mongoose.model("Partner", partnerSchema);
