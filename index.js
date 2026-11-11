import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import mongoStore from "connect-mongo";
import cors from "cors";
import path from "node:path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./configs/swagger.config.js";

import { showResult } from "./utils/helpers.js";
import { logInfo, logWarn, logError } from "./utils/appLogging.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import authRouter from "./routes/auth.route.js";
import applicationRouter from "./routes/application.route.js";

const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL;

const app = express();

// database
await mongoose.connect(MONGODB_URL);
logInfo("database", "Connected to MongoDB");

// security
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, // 100 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) =>
      showResult(
        res,
        "Too many requests. Please wait 15 minutes and try again.",
        429,
        false,
      ),
  }),
);

// body parsing
app.use(express.json());
app.set("json spaces", 2);

// session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore.create({
      client: mongoose.connection.getClient(),
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
    rolling: true,
  }),
);

// home
app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="background-color: black; color: white;">
        <h1>Welcome to the Job Application Tracker</h1>
      </body>
    </html>
  `);
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// api routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/myapps", applicationRouter);

// no matching route
app.use((req, res) => {
  logError(`${req.method} ${req.originalUrl} ${req.ip}`, "Route not found.");
  showResult(
    res,
    "We couldn’t find that page. Check the URL and try again.",
    404,
    false,
  );
});

// error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logInfo("server", `Server is running at http://localhost:${PORT}`);
});
