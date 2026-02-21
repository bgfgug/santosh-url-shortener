import { AxiosError } from "axios";

interface BackendError {
  error?: string;
  code?: string;
  detail?: string;
  [key: string]: unknown;
}

/**
 * Parses an AxiosError and returns a human-readable error message.
 * Handles:
 * 1. Custom format: {"error": "message", "code": "CODE"}
 * 2. DRF detail: {"detail": "message"}
 * 3. Validation errors: {"field": ["error1", "error2"]}
 */
export function getErrorMessage(error: unknown, fallback = "An unexpected error occurred"): string {
  if (!(error instanceof AxiosError)) {
    if (error instanceof Error) return error.message;
    return fallback;
  }

  const data = error.response?.data as BackendError;

  if (!data) return error.message || fallback;

  // 1. Handle our custom "error" field
  if (data.error) return data.error;

  // 2. Handle DRF "detail" field
  if (data.detail) return data.detail;

  // 3. Handle field-specific validation errors (e.g., { email: ["Already exists"] })
  try {
    const errorMessages = Object.entries(data)
      .filter(([key]) => key !== "code") // Ignore the "code" field
      .map(([key, value]) => {
        const message = Array.isArray(value) ? value.join(", ") : value;
        return `${key}: ${message}`;
      });

    if (errorMessages.length > 0) {
      return errorMessages.join("; ");
    }
  } catch {
    // Fallback if parsing logic fails
  }

  return error.message || fallback;
}
