import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: Schema.Types.String,
      required: [true, "username is required!"],
      minlength: [3, "username must be least 3 characters!"],
      maxlength: [20, "username max 20 characters"],
      trim: true,
      unique: true,
    },
    password: {
      type: Schema.Types.String,
      required: [true, "password is required!"],
      minlength: [6, "Password must be at least 6 characters"],
      trim: true,
      validate: {
        validator(pwd) {
          return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=]{6,25}$/.test(
            pwd
          );
        },
        message:
          "Password must contain at least one letter and one number, no spaces.",
      },
      select: false,
    },
    role: {
      type: Schema.Types.String,
      enum: ["admin", "staff", "accountant", "kitchen"],
      default: "staff",
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
    refresh_token: {
      type: String,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ createdAt: -1 });

// Instance method
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refresh_token;
  delete userObject.isDeleted;
  delete userObject.deletedAt;
  return userObject;
};

userSchema.methods.comparePassword = async function (candidate) {
  return await bcrypt.compare(candidate, this.password);
};

// middleware hash password
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    return next();
  } catch (error) {
    return next(error);
  }
});

//static method
userSchema.statics = {
  async createUser(data) {
    const user = new this(data);
    await user.save();
    return user;
  },
  async findUserById(id) {
    const user = await this.findById(id).lean();
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },
  async findAllUsers() {
    return this.find().lean();
  },
  async findUserByUsername(username) {
    return this.findOne({ username }).select("+password");
  },
  async findUsersByName(name) {
    return this.find({ username: new RegExp(name, "i") }).lean();
  },
  async updateUser(id, data) {
    const user = await this.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw new Error("Not found!");
    }
    return user;
  },
  async hideUser(id) {
    const updatedUser = await this.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!updatedUser) throw new Error("Not found!");
    return updatedUser;
  },
  async deleteUser(id) {
    return this.findByIdAndDelete(id);
  },
};

export const User = mongoose.model("User", userSchema);
