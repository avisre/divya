import { getErrorSpec } from "./errorCatalog.js";

export class ApiError extends Error {
  constructor(code, message, details = null, statusOverride = null) {
    const spec = getErrorSpec(code);
    super(message || spec.message);
    this.name = "ApiError";
    this.code = spec.code;
    this.status = statusOverride || spec.status;
    this.details = details;
  }
}

export function createValidationError(message, details = null) {
  return new ApiError("VALIDATION_FAILED", message, details);
}
