import express from "express";
import { partnerController } from "../../controllers/partnerController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const Router = express.Router();

Router.route("/")
  .get(authMiddleware, partnerController.getAll)
  .post(authMiddleware, partnerController.create);

Router.get("/:id", authMiddleware, partnerController.getById);
Router.patch("/update/:id", authMiddleware, partnerController.update);
Router.delete("/hide/:id", authMiddleware, partnerController.hide);
Router.delete("/:id", authMiddleware, partnerController.delete);

export const partnerRouter = Router;
