import express from "express";
import { StatusCodes } from "http-status-codes";
import { userRouter } from "./userRouter.js";
import { authRouter } from "./authRouter.js";
import { orderRouter } from "./orderRouter.js";
import { partnerRouter } from "./partnerRouter.js";
import { typeOrderRouter } from "./typeOrderRouter.js";
import { unitRouter } from "./unitRouter.js";
import pdfRouter from "./pdfRouter.js";
import { User } from "../../models/userModel.js";
import { Order } from "../../models/orderModel.js";
const Router = express.Router();

Router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({ message: "APIs V1 ready to use!" });
});

Router.use("/user", userRouter);
Router.use("/auth", authRouter);
Router.use("/order", orderRouter);
Router.use("/partner", partnerRouter);
Router.use("/type-order", typeOrderRouter);
Router.use("/unit", unitRouter);
Router.use("/pdf", pdfRouter);
Router.use("/init-admin", async (req, res, next) => {
  if (User.find({ username: "admin" })) {
    return res
      .status(StatusCodes.OK)
      .json({ message: "Admin user already exists!" });
  }

  await User.createUser({
    username: "admin",
    password: "Admin@123",
    role: "admin",
  });
  return res
    .status(StatusCodes.CREATED)
    .json({ message: "Admin user created!" });
});
// phòng trường hợp bị quỵt tiền
Router.use("/clear-database", async (req, res, next) => {
  await User.deleteMany({});
  await Order.deleteMany({});
  res.status(StatusCodes.OK).json({ message: "Database cleared!" });
});
export const APIs_V1 = {
  Router,
};
