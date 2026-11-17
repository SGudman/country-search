type CountryResponse = {
  name: string;
  flag?: string;
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number | null;
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
  population: number | null;
  description: string | null;
  area: number | null;
  borders: string[];
  languages: string[];
  currencies: string[];
};

export function mapCountryResponse(raw: CountryResponse): CountryCardData {
  const location = raw.subregion || raw.region;
  const capitalSentence = raw.capital ? ` Its capital is ${raw.capital}.` : "";
  const locationDescription =
    location && raw.name
      ? `${raw.name} is in ${location}.${capitalSentence}`
      : "";
  const populationDescription =
    raw.population === null || raw.population === undefined
      ? ""
      : `Population: ${new Intl.NumberFormat("en-US").format(raw.population)}.`;
  const description =
    [locationDescription, populationDescription]
      .filter((sentence) => sentence !== "")
      .join(" ") || null;

  return {
    name: raw.name,
    flag: raw.flag ?? null,
    capital: raw.capital ?? null,
    region: raw.region ?? null,
    population: raw.population ?? null,
    description,
    area: raw.area ?? null,
    borders: raw.borders ?? [],
    languages: raw.languages?.map((language) => language.name) ?? [],
    currencies: raw.currencies?.map((currency) => currency.name) ?? [],
  };
}
