import { searchCountries } from "../src/searchCountries.js";

function createResponse(ok: boolean, status: number, data: unknown): Response {
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe("searchCountries", () => {
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("requests the country endpoint with the query and abort signal", async () => {
    const signal = new AbortController().signal;
    const countries = [{ name: "Spain" }];
    fetchMock.mockResolvedValue(createResponse(true, 200, countries));

    await expect(searchCountries("spain", signal)).resolves.toEqual(countries);

    expect(fetchMock).toHaveBeenCalledWith("https://countries.dev/name/spain", {
      signal,
    });
  });

  test("treats a 404 response as an empty result", async () => {
    const signal = new AbortController().signal;
    fetchMock.mockResolvedValue(createResponse(false, 404, null));

    await expect(searchCountries("no-match", signal)).resolves.toEqual([]);

    expect(fetchMock).toHaveBeenCalled();
  });

  test("rejects other HTTP failures with their status", async () => {
    const signal = new AbortController().signal;
    fetchMock.mockResolvedValue(createResponse(false, 503, null));

    const result = searchCountries("spain", signal);

    await expect(result).rejects.toBeInstanceOf(Error);
    await expect(result).rejects.toMatchObject({
      name: "HttpError",
      status: 503,
    });
  });

  test("preserves network failures", async () => {
    const signal = new AbortController().signal;
    const networkError = new TypeError("Failed to fetch");
    fetchMock.mockRejectedValue(networkError);

    await expect(searchCountries("spain", signal)).rejects.toBe(networkError);
  });
});
