export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "EMAIL_ALREADY_EXISTS"
  | "LISTING_NOT_FOUND"
  | "INTERNAL_SERVER_ERROR";

export type ApiErrorInit = {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: Record<string, unknown>;
};

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
    status: number;
    details: Record<string, unknown>;
  };
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details: Record<string, unknown>;

  constructor({ code, message, status, details = {} }: ApiErrorInit) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function serializeApiError(error: ApiError): ApiErrorBody {
  return {
    error: {
      code: error.code,
      message: error.message,
      status: error.status,
      details: error.details,
    },
  };
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong while processing the request.",
    status: 500,
  });
}

export function validationError(details: Record<string, unknown>) {
  return new ApiError({
    code: "VALIDATION_ERROR",
    message: "Request validation failed.",
    status: 400,
    details,
  });
}

export function badRequest(message: string, details: Record<string, unknown> = {}) {
  return new ApiError({
    code: "BAD_REQUEST",
    message,
    status: 400,
    details,
  });
}

export function authRequired() {
  return new ApiError({
    code: "AUTH_REQUIRED",
    message: "You must be signed in to perform this action.",
    status: 401,
  });
}

export function forbidden(message = "You do not have permission to perform this action.") {
  return new ApiError({
    code: "FORBIDDEN",
    message,
    status: 403,
  });
}

export function emailAlreadyExists(email: string) {
  return new ApiError({
    code: "EMAIL_ALREADY_EXISTS",
    message: "An account already exists for this email address.",
    status: 409,
    details: { email },
  });
}

export function listingNotFound(id: string) {
  return new ApiError({
    code: "LISTING_NOT_FOUND",
    message: "Listing was not found.",
    status: 404,
    details: { id },
  });
}
