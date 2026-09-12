import { describe, expect, it } from "vitest";
import { nigeriaDateTimeToUTC, utcToNigeriaDateInput } from "./interviews";

describe("nigeriaDateTimeToUTC", () => {
  it("converts Nigeria (WAT, UTC+1) wall-clock time to the correct UTC instant", () => {
    // Regression test for a Stage 12 bug: interview times were stored as raw
    // UTC with no WAT adjustment, so a 10:00 entry displayed as 10:00 UTC
    // instead of 09:00 UTC (i.e. 1 hour off in the UI afterwards).
    const utc = nigeriaDateTimeToUTC("2026-01-15", "10:00");
    expect(utc.toISOString()).toBe("2026-01-15T09:00:00.000Z");
  });

  it("rolls over to the previous UTC day for times just after midnight WAT", () => {
    const utc = nigeriaDateTimeToUTC("2026-01-15", "00:30");
    expect(utc.toISOString()).toBe("2026-01-14T23:30:00.000Z");
  });
});

describe("utcToNigeriaDateInput", () => {
  it("converts a stored UTC instant back to Nigeria wall-clock date/time", () => {
    const { date, time } = utcToNigeriaDateInput(new Date("2026-01-15T09:00:00.000Z"));
    expect(date).toBe("2026-01-15");
    expect(time).toBe("10:00");
  });
});

describe("WAT round trip", () => {
  it("returns the exact same date and time after converting to UTC and back", () => {
    const cases: [string, string][] = [["2026-01-15", "10:00"], ["2026-06-01", "23:45"], ["2026-12-31", "00:15"]];

    for (const [date, time] of cases) {
      const utc = nigeriaDateTimeToUTC(date, time);
      expect(utcToNigeriaDateInput(utc)).toEqual({ date, time });
    }
  });
});
