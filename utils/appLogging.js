import path from "node:path";
import fs from "node:fs";

const LOG_FILE = path.join(import.meta.dirname, "..", "app.log");

const writeEntry = (level, context, fields) => {
  const time = new Date().toISOString();
  const entry = JSON.stringify({
    time,
    level,
    context,
    ...fields,
  });

  switch (level) {
    case "error":
      console.error(entry);
      break;
    case "warn":
      console.warn(entry);
      break;
    case "info":
      console.log(entry);
      break;
    default:
  }

  try {
    fs.appendFileSync(LOG_FILE, entry + "\n", "utf-8");
  } catch (logWriteError) {
    console.error(
      `${time}: Could not write to ${LOG_FILE}. ${logWriteError.message}`,
    );
  }
};

const logInfo = (context, message) => {
  writeEntry("info", context, { message });
};

const logWarn = (context, message) => {
  writeEntry("warn", context, { message });
};

const logError = (context, error) => {
  const details =
    error instanceof Error
      ? { code: error.code, message: error.message, stack: error.stack }
      : { message: String(error) };

  writeEntry("error", context, details);
};

export { logInfo, logWarn, logError };
