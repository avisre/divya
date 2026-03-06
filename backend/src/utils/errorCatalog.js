export const ErrorCatalog = {
  AUTH_REQUIRED: {
    code: "AUTH_REQUIRED",
    status: 401,
    message: "Authentication required"
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    status: 403,
    message: "You do not have permission to perform this action"
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    status: 404,
    message: "Requested resource was not found"
  },
  VALIDATION_FAILED: {
    code: "VALIDATION_FAILED",
    status: 400,
    message: "Request validation failed"
  },
  CONFLICT: {
    code: "CONFLICT",
    status: 409,
    message: "Resource conflict"
  },
  RATE_LIMITED: {
    code: "RATE_LIMITED",
    status: 429,
    message: "Too many requests"
  },
  INTERNAL: {
    code: "INTERNAL",
    status: 500,
    message: "Internal server error"
  }
};

export function getErrorSpec(code) {
  return ErrorCatalog[code] || ErrorCatalog.INTERNAL;
}
