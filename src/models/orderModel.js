import mongoose, { Schema } from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    idOrder: {
      type: Schema.Types.String,
      required: [true, "order id is required!"],
      trim: true,
      unique: true,
    },
    order_date: {
      type: Schema.Types.Date,
      required: [true, "order date is required!"],
    },
    id_type_order: {
      type: Schema.Types.ObjectId,
      ref: "TypeOrder",
      default: null,
    },
    idPartner: {
      type: Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
    },
    customer_name: {
      type: Schema.Types.String,
      required: [true, "customer name is required!"],
      trim: true,
    },
    address: {
      type: Schema.Types.String,
      required: [true, "address is required!"],
      trim: true,
    },
    floor: {
      type: Schema.Types.String,
      trim: true,
      default: null,
    },
    basement: {
      type: Schema.Types.String,
      trim: true,
      default: null,
    },
    customer_quantity: {
      type: Schema.Types.Number,
      required: [true, "customer quantity is required!"],
      min: [1, "customer quantity must be at least 1"],
    },
    note: {
      type: Schema.Types.String,
      trim: true,
      default: null,
    },
    food_list: {
      type: [
        {
          food: {
            type: Schema.Types.String,
            required: true,
            trim: true,
          },
          quantity: {
            type: Schema.Types.String,
            required: true,
            trim: true,
          },
        },
      ],
      required: [true, "food list is required!"],
      default: [],
    },
    serving_time: {
      type: Schema.Types.String,
      trim: true,
      default: null,
    },
    price: {
      type: Schema.Types.Number,
      required: [true, "price is required!"],
      min: [0, "price cannot be negative"],
    },
    unit: {
      type: Schema.Types.ObjectId,
      ref: "Unit",
      default: null,
    },
    discount: {
      type: Schema.Types.Number,
      default: 0,
      min: [0, "discount cannot be negative"],
    },
    vat: {
      type: Schema.Types.Number,
      default: 0,
      min: [0, "vat cannot be negative"],
    },
    transport_charge: {
      type: Schema.Types.Number,
      default: 0,
      min: [0, "transport charge cannot be negative"],
    },
    equipment_charge: {
      type: Schema.Types.Number,
      default: 0,
      min: [0, "equipment charge cannot be negative"],
    },
    table_charge: {
      type: Schema.Types.Number,
      default: 0,
      min: [0, "table charge cannot be negative"],
    },
    service_charge: {
      type: Schema.Types.Number,
      default: 0,
      min: [0, "service charge cannot be negative"],
    },
    other_charge: {
      type: Schema.Types.Number,
      default: 0,
      min: [0, "other charge cannot be negative"],
    },
    arrival_time: {
      type: Schema.Types.String,
      default: null,
    },
    transfer_time: {
      type: Schema.Types.String,
      default: null,
    },
    imagevideo_list: {
      type: [Schema.Types.String],
      default: [],
    },
    idUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user id is required!"],
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

// Compound indexes for better query performance
orderSchema.index({ createdAt: -1 });
orderSchema.index({ idUser: 1, createdAt: -1 });
orderSchema.index({ idPartner: 1, createdAt: -1 });
orderSchema.index({ id_type_order: 1, createdAt: -1 });
orderSchema.index({ order_date: -1 });
orderSchema.index({ price: 1 });

orderSchema.index({
  customer_name: "text",
  address: "text",
  idOrder: "text",
  food_list: "text",
});

// Instance method
orderSchema.methods.toJSON = function () {
  const orderObject = this.toObject();
  delete orderObject.isDeleted;
  delete orderObject.deletedAt;
  return orderObject;
};

// Static methods
orderSchema.statics = {
  async createOrder(data) {
    const order = new this(data);
    await order.save();
    return order;
  },
  async findOrderById(id) {
    const order = await this.findById(id)
      .populate("id_type_order", "_id")
      .populate("idPartner", "_id")
      .populate("unit", "_id")
      .populate("idUser", "email fullName phone")
      .lean();
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  },
  async findAllOrders() {
    return this.find()
      .populate("id_type_order", "_id")
      .populate("idPartner", "_id")
      .populate("unit", "_id")
      .populate("idUser", "email fullName phone")
      .lean();
  },
  async findAllOrdersPaginated(skip, limit) {
    const [total, orders] = await Promise.all([
      this.countDocuments().exec(),
      this.find()
        .populate("id_type_order", "_id")
        .populate("idPartner", "_id")
        .populate("unit", "_id")
        .populate("idUser", "email fullName phone")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
    ]);
    return { orders, total };
  },
  async findAllOrdersWithFilters(skip, limit, filters) {
    const query = {};

    // Fuzzy search - tìm kiếm gần đúng
    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), "i");
      query.$or = [
        { customer_name: searchRegex },
        { address: searchRegex },
        { idOrder: searchRegex },
        { "food_list.food": searchRegex },
      ];
    }

    if (filters.typeOrderId) {
      query.id_type_order = filters.typeOrderId;
    }

    if (filters.partnerId) {
      query.idPartner = filters.partnerId;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      query.order_date = {};
      if (filters.dateFrom) {
        const startDate = new Date(filters.dateFrom);
        startDate.setHours(0, 0, 0, 0);
        query.order_date.$gte = startDate;
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.order_date.$lte = endDate;
      }
    }

    // Price range filter
    if (filters.priceMin !== null || filters.priceMax !== null) {
      query.price = {};
      if (filters.priceMin !== null) {
        query.price.$gte = filters.priceMin;
      }
      if (filters.priceMax !== null) {
        query.price.$lte = filters.priceMax;
      }
    }

    const [total, orders] = await Promise.all([
      this.countDocuments(query),
      this.find(query)
        .populate("id_type_order", "_id")
        .populate("idPartner", "_id")
        .populate("unit", "_id")
        .populate("idUser", "email fullName phone")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
    ]);

    return { orders, total };
  },
  async findOrdersByUser(userId) {
    return this.find({ idUser: userId })
      .populate("id_type_order", "_id")
      .populate("idPartner", "_id")
      .populate("unit", "_id")
      .lean();
  },
  async findOrdersByUserPaginated(userId, skip, limit) {
    const query = { idUser: userId };
    const [total, orders] = await Promise.all([
      this.countDocuments(query).exec(),
      this.find(query)
        .populate("id_type_order", "_id")
        .populate("idPartner", "_id")
        .populate("unit", "_id")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
    ]);
    return { orders, total };
  },

  async updateOrder(id, data) {
    const order = await this.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!order) {
      throw new Error("Order not found!");
    }
    return order;
  },
  async hideOrder(id) {
    const updatedOrder = await this.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!updatedOrder) throw new Error("Order not found!");
    return updatedOrder;
  },
  async deleteOrder(id) {
    return this.findByIdAndDelete(id);
  },
};

export const Order = mongoose.model("Order", orderSchema);
