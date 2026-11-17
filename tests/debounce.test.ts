import { debounce } from "../src/debounce.js";

describe("debounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("waits for the delay before invoking the callback", () => {
    const callback = jest.fn();
    const debouncedCallback = debounce(callback, 100);

    debouncedCallback();

    expect(callback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(99);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("resets the pending timer and keeps only the latest call", () => {
    const callback = jest.fn();
    const debouncedCallback = debounce(callback, 100);

    debouncedCallback("first");
    jest.advanceTimersByTime(50);
    debouncedCallback("latest");

    jest.advanceTimersByTime(99);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("latest");
  });
});
