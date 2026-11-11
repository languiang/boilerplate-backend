import mongoose from "mongoose";

import ApplicationModel from "../models/application.model.js";
import { logInfo, logWarn, logError } from "../utils/appLogging.js";
import {
  showResult,
  trySendEmail,
  getLogHeader,
  escapeRegex,
} from "../utils/helpers.js";
import { APPLICATION_STATUS, REGEX_PATTERNS } from "../utils/constants.js";

const applicationValidator = (body, require = false) => {
  const errors = [];
  const data = body || {};
  const {
    companyName,
    jobTitle,
    jobUrl,
    salary,
    salaryCurrency,
    status,
    followUpAt,
  } = data;

  const shouldCheck = (key) => require || key in data;

  if (
    shouldCheck("companyName") &&
    (typeof companyName !== "string" || companyName.trim() === "")
  )
    errors.push("Enter the company name");

  if (
    shouldCheck("jobTitle") &&
    (typeof jobTitle !== "string" || jobTitle.trim() === "")
  )
    errors.push("Enter the job title");

  if (
    "jobUrl" in data &&
    (typeof jobUrl !== "string" ||
      (jobUrl.trim() !== "" &&
        !REGEX_PATTERNS.httpURL.regex.test(jobUrl.trim())))
  )
    errors.push(REGEX_PATTERNS.httpURL.msg);

  if (
    "salary" in data &&
    ((typeof salary !== "number" && typeof salary !== "string") ||
      !Number.isFinite(Number(salary)) ||
      Number(salary) < 0)
  )
    errors.push("Enter a salary of 0 or more");

  if (
    "salaryCurrency" in data &&
    (typeof salaryCurrency !== "string" ||
      (salaryCurrency.trim() !== "" &&
        !REGEX_PATTERNS.currency.regex.test(
          salaryCurrency.trim().toUpperCase(),
        )))
  )
    errors.push(REGEX_PATTERNS.currency.msg);

  if (
    shouldCheck("status") &&
    (typeof status !== "string" || status.trim() === "")
  ) {
    errors.push("Enter the application status");
  } else if (shouldCheck("status") && !(status in APPLICATION_STATUS)) {
  }
};

const applicationBuilder = (payload) => {
  const updates = {};
  if (payload.companyName !== undefined)
    updates.companyName = payload.companyName.trim();

  if (payload.jobTitle !== undefined)
    updates.jobTitle = payload.jobTitle.trim();

  if (payload.jobUrl !== undefined) updates.jobUrl = payload.jobUrl.trim();

  if (payload.salary !== undefined) updates.salary = Number(payload.salary);

  if (payload.salaryCurrency !== undefined)
    updates.salaryCurrency = payload.salaryCurrency.toUpperCase().trim();

  if (payload.status !== undefined) updates.status = payload.status.trim();

  if (payload.followUpAt !== undefined)
    updates.followUpAt = new Date(payload.followUpAt);

  return updates;
};

export const listApplications = async (req, res, next) => {
  const logHeader = getLogHeader(req);

  try {
    const { companyName, jobTitle, status } = req.query;
    const filter = {
      userId: req.session.userId,
      isArchived: false,
    };

    if (companyName) {
      filter.categoryName = { $regex: escapeRegex(companyName), $options: "i" };
    }

    if (jobTitle) {
      filter.jobTitle = { $regex: escapeRegex(jobTitle), $options: "i" };
    }

    if (status) {
      filter.status = { $regex: `^${escapeRegex(status)}$`, $options: "i" };
    }

    const apps = await ApplicationModel.find(filter);

    logInfo(logHeader, `${apps.length} application/s found`);
    showResult(res, `${apps.length} application/s found`, 200, true, apps);
  } catch (err) {
    if (res.headersSent) return logError(logHeader, err);
    next(err);
  }
};

export const getApplication = async (req, res, next) => {
  const logHeader = getLogHeader(req);

  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      logError(logHeader, "Id provided not valid MongoDB Id.");
      return showResult(res, `Id ${id} is of incorrect format.`, 400, false);
    }

    const filter = {
      _id: id,
      userId: req.session.userId,
      isArchived: false,
    };

    const app = await ApplicationModel.findOne(filter);

    if (app.length === 0) {
      return showResult(res, `Application ${id} not found`, 404, false);
    }

    logInfo(logHeader, `Application ${id} found.`);
    showResult(res, `Application ${id} found.`, 200, true, app);
  } catch (err) {
    if (res.headersSent) return logError(logHeader, err);
    next(err);
  }
};

export const createApplication = async (req, res, next) => {};

export const updateApplication = async (req, res, next) => {};

export const archiveApplication = async (req, res, next) => {};
