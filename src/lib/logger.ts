import winston from "winston";
import { randomUUID } from "node:crypto";

const MAX_MESSAGE_LENGTH = 500;
const MAX_METADATA_STRING_LENGTH = 250;
const MAX_STACK_LENGTH = 1200;
const MAX_LOG_LENGTH = 4000;
const TRACE_ID_PATTERN = /^[a-zA-Z0-9_-]{8,80}$/;
const SECRET_KEY_PATTERN =
  /password|secret|token|authorization|cookie|signature|transcript|audio|email/i;

type SafeValue =
  | string
  | number
  | boolean
  | null
  | SafeValue[]
  | { [key: string]: SafeValue };

type LogContext = {
  file: string;
  function: string;
  traceId: string;
  key: string;
  [key: string]: unknown;
};

function truncate(value: string, maximum: number) {
  return value.length <= maximum ? value : `${value.slice(0, maximum - 1)}…`;
}

export function sanitizeLogValue(value: unknown, depth = 0): SafeValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    return truncate(value.replace(/[\r\n\t]+/g, " "), MAX_METADATA_STRING_LENGTH);
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Error) {
    return {
      name: truncate(value.name, 80),
      message: truncate(value.message, MAX_MESSAGE_LENGTH),
      stack: truncate(value.stack ?? "", MAX_STACK_LENGTH),
    };
  }
  if (depth >= 2) return "[depth-limited]";
  if (Array.isArray(value)) {
    return value.slice(0, 10).map((item) => sanitizeLogValue(item, depth + 1));
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 20)
        .map(([key, item]) => [
          key,
          SECRET_KEY_PATTERN.test(key)
            ? "[redacted]"
            : sanitizeLogValue(item, depth + 1),
        ]),
    );
  }
  return truncate(String(value), MAX_METADATA_STRING_LENGTH);
}

const boundedJson = winston.format.printf((info) => {
  const entry = sanitizeLogValue({
    timestamp: info.timestamp,
    level: info.level,
    service: info.service,
    environment: info.environment,
    message: truncate(String(info.message ?? ""), MAX_MESSAGE_LENGTH),
    file: info.file,
    function: info.function,
    traceId: info.traceId,
    key: info.key,
    ...Object.fromEntries(
      Object.entries(info).filter(
        ([key]) =>
          ![
            "timestamp",
            "level",
            "service",
            "environment",
            "message",
            "file",
            "function",
            "traceId",
            "key",
          ].includes(key),
      ),
    ),
  });
  return truncate(JSON.stringify(entry), MAX_LOG_LENGTH);
});

const transports: winston.transport[] = [new winston.transports.Console()];
if (process.env.LOG_TO_FILE === "true") {
  transports.push(
    new winston.transports.File({
      filename: "logs/offerly.log",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
      tailable: true,
    }),
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  defaultMeta: {
    service: "offerly",
    environment: process.env.NODE_ENV ?? "development",
  },
  format: winston.format.combine(winston.format.timestamp(), boundedJson),
  transports,
});

export function getTraceId(request: Request) {
  const incoming = request.headers.get("x-trace-id");
  return incoming && TRACE_ID_PATTERN.test(incoming) ? incoming : randomUUID();
}

export function logContext(context: LogContext) {
  return context;
}
