const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

const getTimestamp = () => {
  return new Date().toISOString().replace("T", " ").replace("Z", "");
};

/**
 * Custom application logger
 */
export const logger = {
  info: (message, ...meta) => {
    console.log(
      `${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.blue}ℹ [INFO]${colors.reset} ${message}`,
      ...meta
    );
  },

  success: (message, ...meta) => {
    console.log(
      `${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.green}✔ [SUCCESS]${colors.reset} ${message}`,
      ...meta
    );
  },

  warn: (message, ...meta) => {
    console.warn(
      `${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.yellow}⚠ [WARN]${colors.reset} ${message}`,
      ...meta
    );
  },

  error: (message, ...meta) => {
    console.error(
      `${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.red}✖ [ERROR]${colors.reset} ${message}`,
      ...meta
    );
  },

  debug: (message, ...meta) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        `${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.magenta}🔍 [DEBUG]${colors.reset} ${message}`,
        ...meta
      );
    }
  },

  /**
   * HTTP request logging middleware
   */
  httpMiddleware: (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      const statusColor =
        res.statusCode >= 500
          ? colors.red
          : res.statusCode >= 400
          ? colors.yellow
          : res.statusCode >= 300
          ? colors.cyan
          : colors.green;

      console.log(
        `${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.cyan}[HTTP]${colors.reset} ${req.method} ${req.originalUrl} ${statusColor}${res.statusCode}${colors.reset} - ${duration}ms`
      );
    });

    next();
  },
};

export default logger;
