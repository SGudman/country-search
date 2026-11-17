type CountryResponse = {
  name: string;
  flag?: string;
  capital?: string;
  region?: string;
  population: number;
  description?: string;
  area?: number;
  borders?: string[];
  languages?: { name: string }[];
  currencies?: { name: string }[];
};

export type CountryCardData = {
  name: string;
  flag: string | null;
  capital: string | null;
  region: string | null;
  population: number;
  description: string | null;
  area: number | null;
  borders: string[];
  languages: string[];
  currencies: string[];
};

export function mapCountryResponse(raw: CountryResponse): CountryCardData {
  return {
    name: raw.name,
    flag: raw.flag ?? null,
    capital: raw.capital ?? null,
    region: raw.region ?? null,
    population: raw.population,
    description: raw.description ?? null,
    area: raw.area ?? null,
    borders: raw.borders ?? [],
    languages: raw.languages?.map((language) => language.name) ?? [],
    currencies: raw.currencies?.map((currency) => currency.name) ?? [],
  };
}
