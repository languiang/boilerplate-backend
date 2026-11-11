import { logError } from "../utils/appLogging.js";
import { showResult } from "../utils/helpers.js";

export const methodAllowed = (allowedMethods) => (req, res, next) => {
  res.set("Allow", allowedMethods.join(", "));
  logError(
    `${req.method} ${req.baseUrl}${req.route?.path ?? ""}`,
    "Method not allowed.",
  );
  showResult(res, `${req.method} is not allowed on route.`, 405, false);
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  let statusCode = error.status || 500;
  let message = error.message;

  switch (true) {
    case error.type === "entity.parse.failed": {
      statusCode = 400;
      message = "Invalid JSON body.";
      break;
    }

    case error.name === "ValidationError": {
      statusCode = 400;
      break;
    }

    case error.name === "CastError": {
      statusCode = 400;
      message = "Invalid ID.";
      break;
    }

    case error.code === 11000: {
      statusCode = 409;
      message = "Already exists.";
      break;
    }

    case statusCode >= 500: {
      message = "Internal server error.";
      break;
    }

    default:
  }

  logError(`${req.method} ${req.baseUrl}${req.route?.path ?? ""}`, error);
  showResult(res, `${statusCode}: ${message}`, statusCode, false);
};
