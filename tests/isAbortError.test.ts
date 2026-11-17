import { HttpError } from "../src/searchCountries.js";
import { isAbortError } from "../src/isAbortError.js";

describe("isAbortError", () => {
  test("identifies an AbortError as a silent cancellation", () => {
    expect(isAbortError(new DOMException("Aborted", "AbortError"))).toBe(true);
  });

  test("does not treat a TimeoutError as a silent cancellation", () => {
    expect(isAbortError(new DOMException("Timed out", "TimeoutError"))).toBe(
      false,
    );
  });

  test("does not hide an HttpError", () => {
    expect(isAbortError(new HttpError(503))).toBe(false);
  });

  test("does not hide network errors", () => {
    expect(isAbortError(new TypeError("Failed to fetch"))).toBe(false);
  });

  test("does not hide other errors", () => {
    expect(isAbortError(new Error("Unexpected failure"))).toBe(false);
  });
});
