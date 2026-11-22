// src/lib/api/error-handler.ts

export interface ApiErrorPayload {
  message?: string;
  error?: string;
  status?: number;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public status: number;
  public data: ApiErrorPayload | null;

  constructor(message: string, status: number, data: ApiErrorPayload | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  let errorData: ApiErrorPayload | null = null;
  try {
    errorData = await response.json();
  } catch {
    // Non-JSON response or empty body
  }

  const message =
    errorData?.message ||
    errorData?.error ||
    `HTTP ${response.status} ${response.statusText}`;

  return new ApiError(message, response.status, errorData);
}