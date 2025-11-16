import express from "express";
import { typeOrderController } from "../../controllers/typeOrderController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const Router = express.Router();

Router.route("/")
  .get(authMiddleware, typeOrderController.getAll)
  .post(authMiddleware, typeOrderController.create);

Router.get("/:id", authMiddleware, typeOrderController.getById);
Router.patch("/update/:id", authMiddleware, typeOrderController.update);
Router.delete("/hide/:id", authMiddleware, typeOrderController.hide);
Router.delete("/:id", authMiddleware, typeOrderController.delete);

export const typeOrderRouter = Router;
