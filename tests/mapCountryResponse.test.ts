import { mapCountryResponse } from "../src/mapCountryResponse.js";

describe("mapCountryResponse", () => {
  test("maps the countries.dev response fields used by a country card", () => {
    const rawCountry = {
      name: "Canada",
      flag: "🇨🇦",
      capital: "Ottawa",
      region: "Americas",
      population: 38005238,
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
      languages: ["English", "French"],
    });
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
      languages: [],
    });
  });
});
