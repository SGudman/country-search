type CountryCardData = {
  name: string;
  flag: string | null;
  capital: string | null;
  region: string | null;
  population: number;
  languages: string[];
};

export function mapCountryResponse(raw: unknown): CountryCardData {
  void raw;

  return {
    name: "",
    flag: null,
    capital: null,
    region: null,
    population: 0,
    languages: [],
  };
}
