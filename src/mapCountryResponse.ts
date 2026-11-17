type CountryResponse = {
  name: string;
  flag?: string;
  capital?: string;
  region?: string;
  population: number;
  languages?: { name: string }[];
};

type CountryCardData = {
  name: string;
  flag: string | null;
  capital: string | null;
  region: string | null;
  population: number;
  languages: string[];
};

export function mapCountryResponse(raw: CountryResponse): CountryCardData {
  return {
    name: raw.name,
    flag: raw.flag ?? null,
    capital: raw.capital ?? null,
    region: raw.region ?? null,
    population: raw.population,
    languages: raw.languages?.map((language) => language.name) ?? [],
  };
}
