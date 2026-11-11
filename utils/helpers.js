import { sendEmail } from "../services/mail.service.js";

export const showResult = (
  res,
  message,
  statusCode = 200,
  success = true,
  data = undefined,
) => {
  res.status(statusCode).json({
    success,
    message,
    ...(data !== undefined && { data }),
  });
};

export const getLogHeader = (req) =>
  `${req.method} ${req.baseUrl}${req.route?.path ?? ""} ${req.ip} ${req.session?.userId ?? "guest"}`;

export const trySendEmail = async (mailOptions) => {
  try {
    await sendEmail(mailOptions);
    return { sent: true };
  } catch (err) {
    return { sent: false, err };
  }
};

// Escape regex special characters so user input matches as plain text.
export const escapeRegex = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
