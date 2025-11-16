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

// Trust proxy - required for Render, Heroku, etc.
app.set('trust proxy', 1);

const PORT = process.env.PORT || 8081;
const HOST = "0.0.0.0";

const START_SERVER = () => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['https://fetestdeploy.vercel.app'];
  
  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
};

CONNECT_DB()
  .then(() => console.log("Database connected!"))
  .then(() => START_SERVER())
  .catch((error) => {
    console.log(error);
    process.exit(0);
  });
