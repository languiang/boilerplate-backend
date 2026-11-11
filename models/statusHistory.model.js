import mongoose from "mongoose";

import { APPLICATION_STATUS } from "../utils/constants.js";

const statusHistorySchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "application",
      required: [true, "Application ID is required."],
    },
    fromStatus: {
      type: String,
      required: [true, "Previous status is required."],
      trim: true,
      enum: {
        value: APPLICATION_STATUS,
        message: "{VALUE} is not a valid application status.",
      },
    },
    toStatus: {
      type: String,
      required: [true, "New status is required."],
      trim: true,
      enum: {
        value: APPLICATION_STATUS,
        message: "{VALUE} is not a valid application status.",
      },
      validate: {
        validator: (value) => {
          return value !== this.fromStatus;
        },
        message: "New status must be different from the previous status.",
      },
    },
  },
  { timestamps: true },
);

const StatusHistoryModel = mongoose.model("statusHistory", statusHistorySchema);

export default StatusHistoryModel;
