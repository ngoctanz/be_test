import express from "express";
import { StatusCodes } from "http-status-codes";
import { foodRouter } from "./foodRoute.js";

const Router = express.Router();

Router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({ message: "APIs V2 ready to use!" });
});

Router.use("/food", foodRouter);

export const APIs_V2 = {
  Router,
};
