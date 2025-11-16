import express from "express";
import { unitController } from "../../controllers/unitController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const Router = express.Router();

Router.route("/")
  .get(authMiddleware, unitController.getAll)
  .post(authMiddleware, unitController.create);

Router.get("/:id", authMiddleware, unitController.getById);
Router.patch("/update/:id", authMiddleware, unitController.update);
Router.delete("/hide/:id", authMiddleware, unitController.hide);
Router.delete("/:id", authMiddleware, unitController.delete);

export const unitRouter = Router;
