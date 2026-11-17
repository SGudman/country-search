import { debounce } from "./debounce.js";
import { isAbortError } from "./isAbortError.js";
import { mapCountryResponse } from "./mapCountryResponse.js";
import { searchCountries } from "./searchCountries.js";

type RawCountryResponse = Parameters<typeof mapCountryResponse>[0];
type CountryCardData = ReturnType<typeof mapCountryResponse>;

type SearchCallbacks = {
  onResults: (countries: CountryCardData[]) => void;
  onStatus: (message: string) => void;
};

const DEBOUNCE_DELAY_MS = 300;
const REQUEST_TIMEOUT_MS = 10_000;

export function createCountrySearchHandler({
  onResults,
  onStatus,
}: SearchCallbacks): (query: string) => void {
  let activeController: AbortController | undefined;

  async function runSearch(
    query: string,
    requestController: AbortController,
  ): Promise<void> {
    try {
      const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
      const signal = AbortSignal.any([requestController.signal, timeoutSignal]);
      const rawCountries = await searchCountries(query, signal);

      if (requestController.signal.aborted) {
        return;
      }

      const countries = rawCountries.map((rawCountry) =>
        mapCountryResponse(rawCountry as RawCountryResponse),
      );
      onResults(countries);
      onStatus(
        countries.length === 0
          ? "No results."
          : `${countries.length} ${countries.length === 1 ? "result" : "results"}.`,
      );
    } catch (error) {
      if (requestController.signal.aborted || isAbortError(error)) {
        return;
      }

      onStatus("Search failed.");
    } finally {
      if (activeController === requestController) {
        activeController = undefined;
      }
    }
  }

  const debouncedSearch = debounce(
    (query: string, requestController: AbortController) => {
      if (requestController.signal.aborted) {
        return;
      }

      void runSearch(query, requestController);
    },
    DEBOUNCE_DELAY_MS,
  );

  return (query: string): void => {
    activeController?.abort();
    activeController = undefined;
    onResults([]);

    const normalizedQuery = query.trim();
    if (normalizedQuery === "") {
      onStatus("");
      return;
    }

    const requestController = new AbortController();
    activeController = requestController;
    onStatus("Searching…");
    debouncedSearch(normalizedQuery, requestController);
  };
}
