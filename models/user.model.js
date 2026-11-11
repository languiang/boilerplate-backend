import mongoose from "mongoose";

import { REGEX_PATTERNS } from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      match: [REGEX_PATTERNS.name.regex, REGEX_PATTERNS.name.msg],
    },
    email: {
      type: String,
      required: [true, "Email address is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [REGEX_PATTERNS.email.regex, REGEX_PATTERNS.email.msg],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    resetTokenHash: {
      type: String,
      select: false,
    },
    resetTokenExpiresAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true },
);

const UserModel = mongoose.model("user", userSchema);

export default UserModel;
