import { mapCountryResponse } from "../src/mapCountryResponse.js";

describe("mapCountryResponse", () => {
  test("maps the countries.dev fields used by cards and details", () => {
    const rawCountry = {
      name: "Canada",
      flag: "🇨🇦",
      capital: "Ottawa",
      region: "Americas",
      subregion: "Northern America",
      population: 38005238,
      area: 9984670,
      borders: ["USA"],
      currencies: [{ code: "CAD", name: "Canadian dollar", symbol: "$" }],
      languages: [
        {
          name: "English",
          iso639_1: "en",
          iso639_2: "eng",
          nativeName: "English",
        },
        {
          name: "French",
          iso639_1: "fr",
          iso639_2: "fra",
          nativeName: "français",
        },
      ],
    };

    expect(mapCountryResponse(rawCountry)).toEqual({
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
    });
  });

  test("uses region when subregion and capital are absent", () => {
    const rawCountry = {
      name: "Canada",
      region: "Americas",
    };

    expect(mapCountryResponse(rawCountry).description).toBe(
      "Canada is in Americas.",
    );
  });

  test("uses a population-only description when location is absent", () => {
    const rawCountry = {
      name: "Canada",
      capital: "Ottawa",
      population: 38005238,
    };

    expect(mapCountryResponse(rawCountry).description).toBe(
      "Population: 38,005,238.",
    );
  });

  test("maps an absent population to null", () => {
    const rawCountry = { name: "Israel" } as Parameters<
      typeof mapCountryResponse
    >[0];

    const country = mapCountryResponse(rawCountry);
    expect(country.population).toBeNull();
    expect(country.description).toBeNull();
  });

  test("preserves a population of zero", () => {
    const rawCountry = {
      name: "Israel",
      population: 0,
    };

    const country = mapCountryResponse(rawCountry);
    expect(country.population).toBe(0);
    expect(country.description).toBe("Population: 0.");
  });

  test("uses null or an empty array for absent optional fields", () => {
    const rawCountry = {
      name: "Israel",
      population: 9216900,
    };

    expect(mapCountryResponse(rawCountry)).toEqual({
      name: "Israel",
      flag: null,
      capital: null,
      region: null,
      population: 9216900,
      description: "Population: 9,216,900.",
      area: null,
      borders: [],
      languages: [],
      currencies: [],
    });
  });
});
