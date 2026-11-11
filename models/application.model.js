import mongoose from "mongoose";

import { APPLICATION_STATUS, REGEX_PATTERNS } from "../utils/constants.js";

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User ID is required."],
    },
    companyName: {
      type: String,
      required: [true, "Company Name is required."],
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, "Job Title is required."],
      trim: true,
    },
    jobUrl: {
      type: String,
      trim: true,
      match: [REGEX_PATTERNS.httpURL.regex, REGEX_PATTERNS.httpURL.msg],
    },
    salary: {
      type: Number,
      default: 0,
      min: [0, "Salary cannot be negative."],
    },
    salaryCurrency: {
      type: String,
      match: [REGEX_PATTERNS.currency.regex, REGEX_PATTERNS.currency.msg],
      validate: {
        validator: (value) => {
          return value !== this.fromStatus;
        },
        message: "Currency is required if salary is not 0",
      },
    },
    status: {
      type: String,
      required: [true, "Status is required."],
      trim: true,
      default: "Saved",
      enum: {
        value: APPLICATION_STATUS,
        message: "{VALUE} is not a valid application status.",
      },
    },
    followUpAt: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      required: true,
      default: false,
    },
    archivedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const ApplicationModel = mongoose.model("application", applicationSchema);

export default ApplicationModel;
