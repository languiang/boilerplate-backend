import express from "express";

import { methodAllowed } from "../middlewares/errorHandler.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { newApplication, updateApplication, archiveApplication } from "../";

const applicationRouter = express.Router();

applicationRouter
  .route("/")
  .get(listApplications)
  .post(createApplication)
  .all(methodAllowed(["GET", "POST"]));

applicationRouter
  .route("/:id")
  .get(getApplication)
  .patch(updateApplication)
  .all(methodAllowed(["GET", "PATCH"]));

applicationRouter
  .route("/:id/archive")
  .delete(archiveApplication)
  .all(methodAllowed(["DELETE"]));

export default applicationRouter;
