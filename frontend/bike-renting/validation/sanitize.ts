export function trimAndLimit(value: string, maxLen: number) {
  return value.trim().slice(0, maxLen);
}

export function whitelist(value: string, allowed: RegExp, maxLen: number) {
  const cleaned = value
    .split("")
    .filter((ch) => allowed.test(ch))
    .join("");
  return cleaned.trim().slice(0, maxLen);
}

// Пример: сумма (только цифры и точка/запятая)
export function sanitizeMoney(value: string) {
  const v = value.replace(",", ".").replace(/[^0-9.]/g, "");
  // не больше одной точки
  const parts = v.split(".");
  const normalized =
    parts.length <= 2 ? v : `${parts[0]}.${parts.slice(1).join("")}`;
  return normalized.slice(0, 12);
}
