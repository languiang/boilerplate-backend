import bcrypt from "bcrypt";
import crypto from "crypto";

import UserModel from "../models/user.model.js";
import { logInfo, logWarn, logError } from "../utils/appLogging.js";
import { showResult, trySendEmail, getLogHeader } from "../utils/helpers.js";
import { REGEX_PATTERNS } from "../utils/constants.js";

const SIGNUP_MESSAGE = "Thanks for signing up! Check your email to continue.";
const DUMMY_HASH = await bcrypt.hash("dummy-password", 10);

const userValidator = (body, require = false) => {
  const errors = [];
  const data = body || {};
  const { name, email, password } = data;

  const shouldCheck = (key) => require || key in data;

  if (shouldCheck("name") && (typeof name !== "string" || name.trim() === "")) {
    errors.push("Enter your name");
  } else if (shouldCheck("name") && !REGEX_PATTERNS.name.regex.test(name)) {
    errors.push(REGEX_PATTERNS.name.msg);
  }

  if (
    shouldCheck("email") &&
    (typeof email !== "string" || email.trim() === "")
  ) {
    errors.push("Enter your email address");
  } else if (shouldCheck("email") && !REGEX_PATTERNS.email.regex.test(email)) {
    errors.push(REGEX_PATTERNS.email.msg);
  }

  if (
    shouldCheck("password") &&
    (typeof password !== "string" || password.trim() === "")
  ) {
    errors.push("Enter a password");
  } else if (
    shouldCheck("password") &&
    !REGEX_PATTERNS.password.regex.test(password)
  ) {
    errors.push(REGEX_PATTERNS.password.msg);
  }

  return errors;
};

export const getCurrentUser = async (req, res, next) => {
  const logHeader = getLogHeader(req);

  try {
    const user = await UserModel.findById(req.session.userId).select(
      "name email",
    );

    if (!user) return endExpiredSession(req, res, logHeader);

    logInfo(logHeader, `User found: ${user._id}`);
    showResult(res, "User found.", 200, true, user);
  } catch (err) {
    if (res.headersSent) return logError(logHeader, err);
    next(err);
  }
};

export const register = async (req, res, next) => {
  const logHeader = getLogHeader(req);
  const { name, email, password } = req.body || {};
  const errors =
    userValidator({ name, email, password }, true).join(". ") + ".";

  if (errors.length > 1) {
    logError(logHeader, errors);
    return showResult(res, errors, 400, false);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const record = new UserModel({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashedPassword,
    });

    await record.save();

    logInfo(logHeader, "User registered.");
    showResult(res, SIGNUP_MESSAGE, 201);

    const welcome = await trySendEmail({
      to: record.email,
      subject: "Job Application Tracker: Account successfully created",
      name: "Job Application Tracker",
      text: `Hi ${record.name},\n\nWelcome! Your account is ready. You can log in now.`,
    });

    if (welcome.sent) {
      logInfo(logHeader, "Welcome email sent.");
    } else {
      logError(logHeader, welcome.err);
    }
  } catch (err) {
    if (err.code === 11000) {
      logInfo(logHeader, "Duplicate sign-up attempt.");
      showResult(res, SIGNUP_MESSAGE, 201);

      const attempt = await trySendEmail({
        to: email.toLowerCase().trim(),
        subject: "Job Application Tracker: Sign-up attempt with your email",
        name: "Job Application Tracker",
        text: `Hi,\n\nSomeone tried to create a new account with this email address. You already have an account with us, so we didn't create a new one.\n\nIf this was you, log in or reset your password.\n\nIf this wasn't you, you can ignore this email. Your account stays safe.`,
      });

      if (attempt.sent) {
        logInfo(logHeader, "Sign-up attempt email sent.");
      } else {
        logError(logHeader, attempt.err);
      }
    } else {
      if (res.headersSent) return logError(logHeader, err);
      next(err);
    }
  }
};

export const login = async (req, res, next) => {
  const logHeader = getLogHeader(req);
  const { email, password } = req.body || {};
  const errors = userValidator({ email, password }).join(". ") + ".";

  if (errors.length > 1) {
    logError(logHeader, errors);
    return showResult(res, errors, 400, false);
  }

  try {
    const user = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    }).select("+passwordHash");

    const isMatch = await bcrypt.compare(
      password,
      user?.passwordHash ?? DUMMY_HASH,
    );

    if (!user || !isMatch) {
      logError(logHeader, "Invalid credentials.");
      return showResult(
        res,
        "The email or password you entered is incorrect. Check your details and try again, or reset your password if you forgot it.",
        401,
        false,
      );
    }

    req.session.regenerate((err) => {
      if (err) {
        logError(logHeader, err);
        return showResult(
          res,
          "We couldn't log you in. Please try again.",
          500,
          false,
        );
      }

      req.session.userId = user._id;

      logInfo(logHeader, "User logged in.");
      showResult(res, "You're logged in.");
    });
  } catch (err) {
    if (res.headersSent) return logError(logHeader, err);
    next(err);
  }
};

export const logout = (req, res) => {
  const logHeader = getLogHeader(req);

  req.session.destroy((err) => {
    if (err) {
      logError(logHeader, err);
      return showResult(
        res,
        "We couldn't log you out. Please try again.",
        500,
        false,
      );
    }

    res.clearCookie("connect.sid");
    logInfo(logHeader, "User logged out.");
    showResult(res, "You've been logged out.");
  });
};

export const forgotPassword = async (req, res, next) => {
  const logHeader = getLogHeader(req);
  const { email } = req.body || {};
  const errors = userValidator({ email }, false).join(". ") + ".";

  if (errors.length > 1) {
    logError(logHeader, errors);
    return showResult(res, errors, 400, false);
  }

  try {
    const user = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    });

    logInfo(logHeader, "Forgot-password request received.");
    showResult(
      res,
      `If an account exists for ${email}, we sent a link to reset your password. Check your inbox and spam folder. The link expires in 30 minutes.`,
    );

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      const resetTokenExpires = Date.now() + 30 * 60 * 1000;

      user.resetTokenHash = resetTokenHash;
      user.resetTokenExpiresAt = resetTokenExpires;
      await user.save();

      const sendResetEmail = await trySendEmail({
        to: user.email,
        subject: "Job Application Tracker: Requested password reset",
        name: "Job Application Tracker",
        html: `
        <p>Hi ${user.name},</p>
        <p>We received a request to reset the password for your account. You can reset your password by clicking <a href="http://localhost:3000/api/v1/auth/password/reset/${resetToken}">here</a>.</p>
        <p><i>This link will expire in 30 minutes. If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</i></p>
        `,
      });

      if (!sendResetEmail.sent) {
        logError(logHeader, sendResetEmail.err);
      } else {
        logInfo(logHeader, "Reset email sent.");
      }
    }
  } catch (err) {
    if (res.headersSent) return logError(logHeader, err);
    next(err);
  }
};

export const verifyResetToken = async (req, res, next) => {
  const logHeader = getLogHeader(req);
  const resetToken = req.params.token.trim();
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  try {
    const user = await UserModel.findOne({
      resetTokenHash,
      resetTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      logError(logHeader, "Invalid or expired reset token.");
      return showResult(
        res,
        "This password reset link is invalid or has expired. Please request a new one.",
        400,
        false,
      );
    }

    res.locals.user = user;
    next();
  } catch (err) {
    if (res.headersSent) return logError(logHeader, err);
    next(err);
  }
};

export const confirmResetToken = (req, res) => {
  showResult(res, "Your reset link is valid. Enter a new password.");
};

export const resetPassword = async (req, res, next) => {
  const logHeader = getLogHeader(req);
  const { password } = req.body || {};
  const errors = userValidator({ password }, false).join(". ") + ".";

  if (errors.length > 1) {
    logError(logHeader, errors);
    return showResult(res, errors, 400, false);
  }

  try {
    const user = res.locals.user;
    const hashedPassword = await bcrypt.hash(password, 10);

    user.passwordHash = hashedPassword;
    user.resetTokenHash = undefined;
    user.resetTokenExpiresAt = undefined;

    await user.save();

    logInfo(logHeader, "Password reset.");
    showResult(res, "Password successfully reset. You can log in now.");

    const sendPasswordReset = await trySendEmail({
      to: user.email,
      subject: "Job Application Tracker: Password has been reset",
      name: "Job Application Tracker",
      html: `
        <p>Hi ${user.name},</p>
        <p>Your password has been successfully reset.</p>
        `,
    });

    if (!sendPasswordReset.sent) {
      return logError(logHeader, sendPasswordReset.err);
    }
  } catch (err) {
    if (res.headersSent) return logError(logHeader, err);
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  const logHeader = getLogHeader(req);

  try {
    const { currPassword, newPassword } = req.body || {};

    if (typeof currPassword !== "string" || currPassword.trim() === "") {
      logError(logHeader, "Missing old password.");
      return showResult(res, "Enter your current password.", 400, false);
    }

    const errors =
      userValidator({ password: newPassword }, false).join(". ") + ".";

    if (errors.length > 1) {
      logError(logHeader, errors);
      return showResult(res, errors, 400, false);
    }

    const user = await UserModel.findById(req.session.userId).select(
      "+passwordHash",
    );

    if (!user) return endExpiredSession(req, res, logHeader);

    const isMatch = await bcrypt.compare(currPassword, user.passwordHash);

    if (!isMatch) {
      logError(logHeader, "Old password mismatch.");
      return showResult(
        res,
        "The current password you entered is incorrect. Try again.",
        400,
        false,
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.passwordHash = hashedPassword;

    await user.save();

    logInfo(logHeader, "Password changed.");
    showResult(res, "Your password has been changed.");

    const sendPasswordChange = await trySendEmail({
      to: user.email,
      subject: "Job Application Tracker: Password has been changed",
      name: "Job Application Tracker",
      html: `
        <p>Hi ${user.name},</p>
        <p>Your password has been successfully changed.</p>
        `,
    });

    if (!sendPasswordChange.sent) {
      return logError(logHeader, sendPasswordChange.err);
    }
  } catch (err) {
    if (res.headersSent) return logError(logHeader, err);
    next(err);
  }
};

// End a session whose user no longer exists.
export const endExpiredSession = (req, res, logHeader) =>
  req.session.destroy((err) => {
    if (err) {
      logError(logHeader, err);
      return showResult(
        res,
        "Something went wrong. Please log in again.",
        500,
        false,
      );
    }

    res.clearCookie("connect.sid");
    logError(logHeader, "User not found. Destroyed session.");
    showResult(
      res,
      "Your session has expired. Please log in again.",
      401,
      false,
    );
  });
