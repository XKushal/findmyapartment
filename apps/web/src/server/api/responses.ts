import { ApiError, normalizeApiError, serializeApiError } from "@/server/api/errors";

export type ApiSuccessBody<TData> = {
  data: TData;
};

export function apiData<TData>(data: TData, init?: ResponseInit) {
  return Response.json(
    { data } satisfies ApiSuccessBody<TData>,
    {
      status: init?.status ?? 200,
      headers: init?.headers,
    },
  );
}

export function apiErrorResponse(error: unknown) {
  const apiError = normalizeApiError(error);

  return Response.json(serializeApiError(apiError), {
    status: apiError.status,
  });
}

export async function withApiErrorHandling(
  handler: () => Promise<Response>,
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export function throwIfInvalid<T>(
  result: { success: true; data: T } | { success: false; error: { flatten: () => unknown } },
): T {
  if (result.success) {
    return result.data;
  }

  throw new ApiError({
    code: "VALIDATION_ERROR",
    message: "Request validation failed.",
    status: 400,
    details: { validation: result.error.flatten() },
  });
}
