import mongoose, { Schema } from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    name: {
      type: Schema.Types.String,
      required: [true, "unit name is required!"],
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

unitSchema.index({ createdAt: -1 });

// Instance method
unitSchema.methods.toJSON = function () {
  const unitObject = this.toObject();
  delete unitObject.isDeleted;
  delete unitObject.deletedAt;
  return unitObject;
};

// Static methods
unitSchema.statics = {
  async createUnit(data) {
    const unit = new this(data);
    await unit.save();
    return unit;
  },
  async findUnitById(id) {
    const unit = await this.findById(id).lean();
    if (!unit) {
      throw new Error("Unit not found");
    }
    return unit;
  },
  async findAllUnits() {
    return this.find().lean();
  },
  async findUnitByName(name) {
    return this.findOne({ name: new RegExp(name, "i") }).lean();
  },
  async updateUnit(id, data) {
    const unit = await this.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!unit) {
      throw new Error("Unit not found!");
    }
    return unit;
  },
  async hideUnit(id) {
    const updatedUnit = await this.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!updatedUnit) throw new Error("Unit not found!");
    return updatedUnit;
  },
  async deleteUnit(id) {
    return this.findByIdAndDelete(id);
  },
};

export const Unit = mongoose.model("Unit", unitSchema);
