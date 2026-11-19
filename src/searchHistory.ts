const SEARCH_HISTORY_STORAGE_KEY = "country-search-history";
const MAX_SEARCH_HISTORY_LENGTH = 10;

export function loadSearchHistory(): string[] {
  try {
    const savedHistory = globalThis.localStorage.getItem(
      SEARCH_HISTORY_STORAGE_KEY,
    );
    if (savedHistory === null) {
      return [];
    }

    const parsedHistory: unknown = JSON.parse(savedHistory);
    if (!Array.isArray(parsedHistory)) {
      return [];
    }

    const validHistory = parsedHistory.filter(
      (query): query is string =>
        typeof query === "string" && query.trim() !== "",
    );
    const recentHistory = validHistory.slice(0, MAX_SEARCH_HISTORY_LENGTH);

    if (recentHistory.length !== parsedHistory.length) {
      try {
        globalThis.localStorage.setItem(
          SEARCH_HISTORY_STORAGE_KEY,
          JSON.stringify(recentHistory),
        );
      } catch {
        // Reading history still works when storage is read-only.
      }
    }

    return recentHistory;
  } catch {
    return [];
  }
}

export function recordSearchHistory(
  query: string,
  currentHistory: string[],
): string[] {
  const normalizedQuery = query.trim();
  if (normalizedQuery === "") {
    return currentHistory;
  }

  const updatedHistory = [
    normalizedQuery,
    ...currentHistory.filter((item) => item !== normalizedQuery),
  ].slice(0, MAX_SEARCH_HISTORY_LENGTH);

  try {
    globalThis.localStorage.setItem(
      SEARCH_HISTORY_STORAGE_KEY,
      JSON.stringify(updatedHistory),
    );
  } catch {
    // The search remains usable when browser storage is unavailable.
  }

  return updatedHistory;
}
