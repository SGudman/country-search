import { mapCountryResponse } from "../src/mapCountryResponse.js";
import { createCountrySearchHandler } from "../src/searchController.js";

function createResponse(ok: boolean, status: number, data: unknown): Response {
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe("createCountrySearchHandler", () => {
  let fetchMock: jest.SpyInstance;
  let resultUpdates: ReturnType<typeof mapCountryResponse>[][];
  let statusUpdates: string[];
  let handleInput: (query: string) => void;

  beforeEach(() => {
    jest.useFakeTimers();
    fetchMock = jest.spyOn(globalThis, "fetch");
    resultUpdates = [];
    statusUpdates = [];
    handleInput = createCountrySearchHandler({
      onResults: (countries) => {
        resultUpdates.push(countries);
      },
      onStatus: (status) => {
        statusUpdates.push(status);
      },
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("aborts the active request immediately on each input", async () => {
    const requestSignals: AbortSignal[] = [];
    fetchMock.mockImplementation((_input, init) => {
      const signal = init?.signal;
      if (signal === undefined || signal === null) {
        return Promise.reject(new Error("Expected an abort signal"));
      }

      requestSignals.push(signal);
      return new Promise<Response>((resolve, reject) => {
        void resolve;
        signal.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        );
      });
    });

    handleInput("ca");
    await jest.advanceTimersByTimeAsync(300);
    expect(requestSignals).toHaveLength(1);

    handleInput("canada");
    expect(requestSignals[0].aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    expect(statusUpdates.at(-1)).toBe("Searching…");

    await jest.advanceTimersByTimeAsync(300);
    expect(requestSignals).toHaveLength(2);

    handleInput("");
    expect(requestSignals[1].aborted).toBe(true);
    expect(statusUpdates.at(-1)).toBe("");
    await jest.advanceTimersByTimeAsync(300);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("does not send a queued request after the input is cleared", async () => {
    handleInput("canada");
    handleInput("");

    await jest.advanceTimersByTimeAsync(300);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(resultUpdates.at(-1)).toEqual([]);
    expect(statusUpdates.at(-1)).toBe("");
  });

  test("composes input abort with a 10-second timeout signal", async () => {
    const timeoutControllers: AbortController[] = [];
    const timeoutDurations: number[] = [];
    const timeoutSpy = jest
      .spyOn(AbortSignal, "timeout")
      .mockImplementation((duration) => {
        timeoutDurations.push(duration);
        const controller = new AbortController();
        timeoutControllers.push(controller);
        return controller.signal;
      });
    const requestSignals: AbortSignal[] = [];

    fetchMock.mockImplementation((_input, init) => {
      const signal = init?.signal;
      if (signal === undefined || signal === null) {
        return Promise.reject(new Error("Expected an abort signal"));
      }

      requestSignals.push(signal);
      return new Promise<Response>((_resolve, reject) => {
        if (signal.aborted) {
          reject(signal.reason);
          return;
        }
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      });
    });

    handleInput("ca");
    await jest.advanceTimersByTimeAsync(300);
    expect(timeoutSpy).toHaveBeenCalledWith(10_000);
    expect(requestSignals).toHaveLength(1);

    handleInput("canada");
    expect(requestSignals[0].aborted).toBe(true);
    await Promise.resolve();
    expect(statusUpdates.at(-1)).toBe("Searching…");

    await jest.advanceTimersByTimeAsync(300);
    expect(requestSignals).toHaveLength(2);
    expect(timeoutDurations).toEqual([10_000, 10_000]);

    timeoutControllers[1].abort(new DOMException("Timed out", "TimeoutError"));
    expect(requestSignals[1].aborted).toBe(true);
    await Promise.resolve();
    await Promise.resolve();
    expect(statusUpdates.at(-1)).toBe("Search failed.");
  });

  test("keeps a 404 as an empty result instead of an error", async () => {
    fetchMock.mockResolvedValueOnce(createResponse(false, 404, null));

    handleInput("no-match");
    await jest.advanceTimersByTimeAsync(300);

    expect(resultUpdates.at(-1)).toEqual([]);
    expect(statusUpdates.at(-1)).toBe("No results.");
  });

  test("maps a successful response without rendering placeholder data", async () => {
    const rawCountries = [
      {
        name: "Canada",
        flag: "🇨🇦",
        capital: "Ottawa",
        region: "Americas",
        subregion: "Northern America",
        population: 38005238,
        area: 9984670,
        borders: ["USA"],
        languages: [{ name: "English" }, { name: "French" }],
        currencies: [{ name: "Canadian dollar" }],
      },
    ];
    fetchMock.mockResolvedValueOnce(createResponse(true, 200, rawCountries));

    handleInput("canada");
    await jest.advanceTimersByTimeAsync(300);

    expect(resultUpdates.at(-1)).toEqual([
      {
        name: "Canada",
        flag: "🇨🇦",
        capital: "Ottawa",
        region: "Americas",
        population: 38005238,
        description:
          "Canada is in Northern America. Its capital is Ottawa. Population: 38,005,238.",
        area: 9984670,
        borders: ["USA"],
        languages: ["English", "French"],
        currencies: ["Canadian dollar"],
      },
    ]);
    expect(statusUpdates.at(-1)).toBe("1 result.");
  });
});
