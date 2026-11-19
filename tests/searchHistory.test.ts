import {
  loadSearchHistory,
  recordSearchHistory,
} from "../src/searchHistory.js";

const storageKey = "country-search-history";

describe("search history storage", () => {
  const originalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  let values: Map<string, string>;
  let storage: Pick<Storage, "getItem" | "setItem">;

  beforeEach(() => {
    values = new Map();
    storage = {
      getItem: jest.fn((key: string) => values.get(key) ?? null),
      setItem: jest.fn((key: string, value: string) => {
        values.set(key, value);
      }),
    };
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: storage,
    });
  });

  afterEach(() => {
    if (originalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalStorage);
    } else {
      Reflect.deleteProperty(globalThis, "localStorage");
    }
  });

  test("loads saved string queries", () => {
    values.set(storageKey, '["Japan","Canada"]');

    expect(loadSearchHistory()).toEqual(["Japan", "Canada"]);
  });

  test("limits restored history to the latest ten queries", () => {
    const savedHistory = Array.from(
      { length: 12 },
      (_, index) => `Query ${index + 1}`,
    );
    values.set(storageKey, JSON.stringify(savedHistory));

    const latestTen = savedHistory.slice(0, 10);

    expect(loadSearchHistory()).toEqual(latestTen);
    expect(JSON.parse(values.get(storageKey) ?? "[]")).toEqual(latestTen);
  });

  test("returns an empty history when there is no saved value", () => {
    expect(loadSearchHistory()).toEqual([]);
  });

  test("ignores malformed or invalid stored data", () => {
    values.set(storageKey, "not-json");
    expect(loadSearchHistory()).toEqual([]);

    values.set(storageKey, '{"query":"Canada"}');
    expect(loadSearchHistory()).toEqual([]);

    values.set(storageKey, '["Japan",4,"",null]');
    expect(loadSearchHistory()).toEqual(["Japan"]);
  });

  test("records the latest query first without duplicating it", () => {
    values.set(storageKey, '["Canada","Japan"]');

    const updatedHistory = recordSearchHistory("Japan", loadSearchHistory());

    expect(updatedHistory).toEqual(["Japan", "Canada"]);
    expect(storage.setItem).toHaveBeenCalledWith(
      storageKey,
      '["Japan","Canada"]',
    );
    expect(loadSearchHistory()).toEqual(["Japan", "Canada"]);
  });

  test("keeps at most ten queries when a new search is recorded", () => {
    const previousHistory = Array.from(
      { length: 10 },
      (_, index) => `Query ${index + 1}`,
    );

    const updatedHistory = recordSearchHistory("New query", previousHistory);

    expect(updatedHistory).toEqual([
      "New query",
      ...previousHistory.slice(0, 9),
    ]);
    expect(updatedHistory).toHaveLength(10);
    expect(JSON.parse(values.get(storageKey) ?? "[]")).toEqual(updatedHistory);
  });

  test("continues safely when localStorage is unavailable", () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new Error("Storage is blocked");
      },
    });

    expect(loadSearchHistory()).toEqual([]);
    expect(recordSearchHistory("Canada", [])).toEqual(["Canada"]);
  });

  test("continues safely when localStorage read or write throws", () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: () => {
          throw new Error("Read failed");
        },
        setItem: () => {
          throw new Error("Write failed");
        },
      },
    });

    expect(loadSearchHistory()).toEqual([]);
    expect(recordSearchHistory("Canada", [])).toEqual(["Canada"]);
  });
});
