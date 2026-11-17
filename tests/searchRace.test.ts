import type { CountryCardData } from "../src/mapCountryResponse.js";
import { createCountrySearchHandler } from "../src/searchController.js";

function createResponse(country: object): Response {
  return new Response(JSON.stringify([country]), { status: 200 });
}

describe("country search request race", () => {
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    fetchMock = jest.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("keeps only the latest response in the rendered result state", async () => {
    const requests: Array<{
      signal: AbortSignal;
      resolve: (response: Response) => void;
    }> = [];
    let renderedCountries: CountryCardData[] = [];

    fetchMock.mockImplementation((_input, init) => {
      const signal = init?.signal;
      if (signal === undefined || signal === null) {
        return Promise.reject(new Error("Expected an abort signal"));
      }

      return new Promise<Response>((resolve, reject) => {
        if (signal.aborted) {
          reject(signal.reason);
          return;
        }

        requests.push({ signal, resolve });
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      });
    });

    const handleInput = createCountrySearchHandler({
      onResults: (countries) => {
        renderedCountries = countries;
      },
      onStatus: () => {},
    });

    handleInput("israel");
    await jest.advanceTimersByTimeAsync(300);
    expect(requests).toHaveLength(1);

    const olderRequest = requests[0];
    handleInput("canada");
    expect(olderRequest.signal.aborted).toBe(true);
    await jest.advanceTimersByTimeAsync(300);
    expect(requests).toHaveLength(2);

    const latestRequest = requests[1];
    latestRequest.resolve(
      createResponse({
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
      }),
    );
    await jest.advanceTimersByTimeAsync(0);

    olderRequest.resolve(
      createResponse({ name: "Israel", population: 9216900 }),
    );
    await jest.advanceTimersByTimeAsync(0);

    expect(renderedCountries.map(({ name }) => name)).toEqual(["Canada"]);
  });
});
