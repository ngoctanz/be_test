import mongoose, { Schema } from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: Schema.Types.String,
      required: [true, "Food name is required!"],
      trim: true,
    },
    price: {
      type: Schema.Types.Number,
      required: [true, "Price is required!"],
      min: [0, "Price cannot be negative"],
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

// Indexes
foodSchema.index({ name: "text" });
foodSchema.index({ createdAt: -1 });
foodSchema.index({ price: 1 });

// Instance method
foodSchema.methods.toJSON = function () {
  const foodObject = this.toObject();
  delete foodObject.isDeleted;
  delete foodObject.deletedAt;
  return foodObject;
};

// Static methods
foodSchema.statics = {
  async createFood(data) {
    const food = new this(data);
    await food.save();
    return food;
  },

  async findFoodById(id) {
    const food = await this.findById(id).lean();
    if (!food) {
      throw new Error("Food not found");
    }
    return food;
  },

  async findAllFoods() {
    return this.find().sort({ createdAt: -1 }).lean();
  },

  async findAllFoodsPaginated(skip, limit) {
    const [total, foods] = await Promise.all([
      this.countDocuments().exec(),
      this.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
    ]);
    return { foods, total };
  },

  async searchFoods(searchTerm, skip, limit) {
    const query = searchTerm
      ? { name: { $regex: searchTerm, $options: "i" } }
      : {};
    const [total, foods] = await Promise.all([
      this.countDocuments(query).exec(),
      this.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
    ]);
    return { foods, total };
  },

  async updateFood(id, data) {
    const food = await this.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!food) {
      throw new Error("Food not found!");
    }
    return food;
  },

  async hideFood(id) {
    const updatedFood = await this.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!updatedFood) throw new Error("Food not found!");
    return updatedFood;
  },

  async deleteFood(id) {
    return this.findByIdAndDelete(id);
  },
};

export const Food = mongoose.model("Food", foodSchema);
