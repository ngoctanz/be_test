import express from "express";
import { APIs_V1 } from "./routes/v1/index.js";
import { APIs_V2 } from "./routes/v2/index.js";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import {
  errorHandlingMiddleware,
  notFoundHandler,
} from "./middlewares/errorHandlingMiddlewares.js";
import { CONNECT_DB } from "./config/mongodb.js";

const app = express();
const port = process.env.APP_PORT;
const host = process.env.APP_HOST;

const START_SERVER = () => {
  const corsOptions = {
    origin: true, // Cho phép tất cả origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());
  app.use("/v1", APIs_V1.Router);
  app.use("/v2", APIs_V2.Router);

  app.use(notFoundHandler);
  app.use(errorHandlingMiddleware);

  app.listen(port, host, () => {
    console.log(`Example app listening on http://${host}:${port}`);
  });
};
CONNECT_DB()
  .then(() => console.log("Database connected!"))
  .then(() => START_SERVER())
  .catch((error) => {
    console.log(error);
    process.exit(0);
  });
