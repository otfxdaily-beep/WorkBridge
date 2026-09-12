import { describe, expect, it } from "vitest";
import { formatNaira, formatSalaryRange, formatRelativeDate, slugify, titleCase } from "./utils";

describe("formatNaira", () => {
  it("formats a whole number as Naira currency", () => {
    expect(formatNaira(350000)).toBe("₦350,000");
  });

  it("returns null for null or undefined", () => {
    expect(formatNaira(null)).toBeNull();
    expect(formatNaira(undefined)).toBeNull();
  });
});

describe("formatSalaryRange", () => {
  it("formats a min-max range with frequency", () => {
    expect(formatSalaryRange(350000, 500000, "MONTHLY")).toBe("₦350,000 - ₦500,000 / Monthly");
  });

  it("formats a min-only range as 'From'", () => {
    expect(formatSalaryRange(350000, null, "MONTHLY")).toBe("From ₦350,000 / Monthly");
  });

  it("formats a max-only range as 'Up to'", () => {
    expect(formatSalaryRange(null, 500000, "ANNUAL")).toBe("Up to ₦500,000 / Annual");
  });

  it("falls back to 'Salary not disclosed' when neither is set", () => {
    expect(formatSalaryRange(null, null, "MONTHLY")).toBe("Salary not disclosed");
  });
});

describe("formatRelativeDate", () => {
  it("returns 'Today' for the current moment", () => {
    expect(formatRelativeDate(new Date())).toBe("Today");
  });

  it("returns 'Yesterday' for one day ago", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(yesterday)).toBe("Yesterday");
  });

  it("returns '<n> days ago' for less than a week", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(threeDaysAgo)).toBe("3 days ago");
  });

  it("returns '<n>w ago' for less than a month", () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(twoWeeksAgo)).toBe("2w ago");
  });

  it("returns a formatted date for a month or more ago", () => {
    const result = formatRelativeDate(new Date(Date.now() - 40 * 24 * 60 * 60 * 1000));
    expect(result).not.toMatch(/ago$/);
  });
});

describe("slugify", () => {
  it("lowercases, replaces '&' with 'and', and hyphenates non-alphanumerics", () => {
    expect(slugify("Sales & Marketing Manager")).toBe("sales-and-marketing-manager");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  Frontend Developer!!  ")).toBe("frontend-developer");
  });
});

describe("titleCase", () => {
  it("converts an upper snake_case enum value into title case words", () => {
    expect(titleCase("UNDER_REVIEW")).toBe("Under Review");
  });

  it("handles a single-word value", () => {
    expect(titleCase("PUBLISHED")).toBe("Published");
  });
});
