import mongoose from "mongoose";

import { REGEX_PATTERNS } from "../utils/constants.js";

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "application",
      required: [true, "Application ID is required."],
    },
    title: {
      type: String,
      required: [true, "Interview title is required."],
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, "Scheduled date and time is required."],
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 60,
    },
    mode: {
      type: String,
      lowercase: true,
      trim: true,
      enum: {
        values: ["online", "onsite"],
        message: "{VALUE} is not a valid interview mode.",
      },
    },
    location: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
      match: [REGEX_PATTERNS.httpURL.regex, REGEX_PATTERNS.httpURL.msg],
    },
    notes: {
      type: String,
      trim: true,
    },
    icsUid: {
      type: String,
      trim: true,
    },
    icsSequence: {
      type: Number,
      default: 0,
      min: [0, "Sequence number cannot be negative."],
    },
    icsSentAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const InterviewModel = mongoose.model("interview", interviewSchema);

export default InterviewModel;
