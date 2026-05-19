const DEFAULT_AUTH_CALLBACK_URL = "/listings";

export function resolveAuthCallbackUrl(value: string | string[] | undefined) {
  const callbackUrl = Array.isArray(value) ? value[0] : value;

  if (!callbackUrl?.startsWith("/") || callbackUrl.startsWith("//")) {
    return DEFAULT_AUTH_CALLBACK_URL;
  }

  return callbackUrl;
}
