// src/lib/logger.ts

import pino, {
  Logger,
  LoggerOptions,
  stdTimeFunctions,
} from "pino"

/**
 * Environment detection
 */
const isDevelopment = process.env.NODE_ENV !== "production"

/**
 * Base logger configuration
 */
const options: LoggerOptions = {
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),

  /**
   * Structured timestamps
   */
  timestamp: stdTimeFunctions.isoTime,

  /**
   * Common metadata attached to every log
   */
  base: {
    service: process.env.SERVICE_NAME || "exceller-learning-app",
    environment: process.env.NODE_ENV || "development",
  },

  /**
   * Redact sensitive fields automatically
   */
  redact: {
    paths: [
      "password",
      "token",
      "accessToken",
      "refreshToken",
      "authorization",
      "cookie",
      "headers.authorization",
      "headers.cookie",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    censor: "[REDACTED]",
  },

  /**
   * Pretty logs locally
   */
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
}

/**
 * Root logger instance
 */
export const logger: Logger = pino(options)

/**
 * Helper to create request-scoped child loggers
 */
export function createRequestLogger(requestId: string) {
  return logger.child({
    requestId,
  })
}

/**
 * Helper for API route logging
 */
export function logApiRequest(params: {
  method: string
  path: string
  requestId?: string
  userId?: string
  durationMs?: number
  statusCode?: number
}) {
  logger.info({
    event: "api_request",
    ...params,
  })
}

/**
 * Helper for application errors
 */
export function logError(params: {
  error: unknown
  message?: string
  requestId?: string
  userId?: string
  metadata?: Record<string, unknown>
}) {
  logger.error({
    event: "application_error",
    message: params.message,
    requestId: params.requestId,
    userId: params.userId,
    metadata: params.metadata,
    err:
      params.error instanceof Error
        ? {
            name: params.error.name,
            message: params.error.message,
            stack: params.error.stack,
          }
        : params.error,
  })
}

/**
 * Helper for audit/security events
 */
export function logAuditEvent(params: {
  action: string
  userId?: string
  requestId?: string
  resource?: string
  metadata?: Record<string, unknown>
}) {
  logger.info({
    event: "audit_event",
    timestamp: new Date().toISOString(),
    ...params,
  })
}