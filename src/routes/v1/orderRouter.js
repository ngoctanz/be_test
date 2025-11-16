import express from "express";
import { orderController } from "../../controllers/orderController.js";
import { orderValidation } from "../../validations/orderValidation.js";
import { authMiddleware, authorize } from "../../middlewares/authMiddleware.js";
import { upload } from "../../middlewares/uploadMiddleware.js";

const Router = express.Router();

Router.route("/")
  .get(authMiddleware, orderController.getAll)
  .post(
    authMiddleware,
    authorize("admin", "staff"),
    upload.array("files", 10),
    orderValidation.createOrder,
    orderController.create
  );

Router.route("/search").get(authMiddleware, orderController.search);

Router.route("/:id")
  .get(authMiddleware, orderController.getById)
  .put(
    authMiddleware,
    authorize("admin", "staff"),
    upload.array("files", 10),
    orderController.update
  )
  .delete(authMiddleware, authorize("admin", "staff"), orderController.remove);

Router.route("/:id/hide").patch(
  authMiddleware,
  authorize("admin", "staff"),
  orderController.hide
);

Router.route("/user/:userId").get(
  authMiddleware,
  authorize("admin", "staff"),
  orderController.getByUserId
);

export const orderRouter = Router;
