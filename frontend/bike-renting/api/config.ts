const DEFAULT_API_URL = "http://localhost:8080/api";

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_URL = (configuredApiUrl || DEFAULT_API_URL).replace(
  /\/+$/,
  "",
);
