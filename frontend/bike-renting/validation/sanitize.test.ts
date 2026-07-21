import { sanitizeMoney, trimAndLimit, whitelist } from "./sanitize";

describe("input sanitizers", () => {
  it("trims and limits text", () => {
    expect(trimAndLimit("  bicycle  ", 4)).toBe("bicy");
  });

  it("keeps only allowed characters", () => {
    expect(whitelist(" bike-42! ", /[a-z0-9-]/i, 20)).toBe("bike-42");
  });

  it("normalizes a monetary value", () => {
    expect(sanitizeMoney("12,3.4 RUB")).toBe("12.34");
  });
});
