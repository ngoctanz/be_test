import mongoose, { Schema } from "mongoose";

const typeOrderSchema = new mongoose.Schema(
  {
    type_name: {
      type: Schema.Types.String,
      required: [true, "type order name is required!"],
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

typeOrderSchema.index({ createdAt: -1 });

// Instance method
typeOrderSchema.methods.toJSON = function () {
  const typeOrderObject = this.toObject();
  delete typeOrderObject.isDeleted;
  delete typeOrderObject.deletedAt;
  return typeOrderObject;
};

// Static methods
typeOrderSchema.statics = {
  async createTypeOrder(data) {
    const typeOrder = new this(data);
    await typeOrder.save();
    return typeOrder;
  },
  async findTypeOrderById(id) {
    const typeOrder = await this.findById(id).lean();
    if (!typeOrder) {
      throw new Error("Type order not found");
    }
    return typeOrder;
  },
  async findAllTypeOrders() {
    return this.find().lean();
  },
  async findTypeOrderByName(name) {
    return this.findOne({ type_name: new RegExp(name, "i") }).lean();
  },
  async updateTypeOrder(id, data) {
    const typeOrder = await this.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!typeOrder) {
      throw new Error("Type order not found!");
    }
    return typeOrder;
  },
  async hideTypeOrder(id) {
    const updatedTypeOrder = await this.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!updatedTypeOrder) throw new Error("Type order not found!");
    return updatedTypeOrder;
  },
  async deleteTypeOrder(id) {
    return this.findByIdAndDelete(id);
  },
};

export const TypeOrder = mongoose.model("TypeOrder", typeOrderSchema);
