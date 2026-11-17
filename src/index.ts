import { createCountrySearchHandler } from "./searchController.js";
import type { CountryCardData } from "./mapCountryResponse.js";

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("en-US").format(value);

const title = document.createElement("h1");
title.className = "search-stage-title";
title.textContent = "Country Search";

const main = document.createElement("main");
main.className = "country-search-main";

const searchStage = document.createElement("div");
searchStage.className = "search-stage";

const searchPanel = document.createElement("section");
searchPanel.className = "search-panel";
searchPanel.setAttribute("aria-labelledby", "country-search-label");

const label = document.createElement("label");
label.id = "country-search-label";
label.className = "visually-hidden";
label.htmlFor = "country-search-input";
label.textContent = "Search countries";

const searchInputWrapper = document.createElement("div");
searchInputWrapper.className = "search-input-wrapper";

const input = document.createElement("input");
input.id = "country-search-input";
input.className = "country-search-input";
input.name = "country";
input.type = "search";
input.placeholder = "Search countries…";
input.autocomplete = "off";
input.setAttribute("aria-controls", "country-results");

const svgNamespace = "http://www.w3.org/2000/svg";
const searchIcon = document.createElementNS(svgNamespace, "svg");
searchIcon.classList.add("search-input-icon");
searchIcon.setAttribute("viewBox", "0 0 24 24");
searchIcon.setAttribute("aria-hidden", "true");
searchIcon.setAttribute("focusable", "false");

const searchIconCircle = document.createElementNS(svgNamespace, "circle");
searchIconCircle.setAttribute("cx", "10.5");
searchIconCircle.setAttribute("cy", "10.5");
searchIconCircle.setAttribute("r", "6.5");
searchIconCircle.setAttribute("fill", "none");
searchIconCircle.setAttribute("stroke", "currentColor");
searchIconCircle.setAttribute("stroke-width", "1.7");

const searchIconHandle = document.createElementNS(svgNamespace, "line");
searchIconHandle.setAttribute("x1", "15.5");
searchIconHandle.setAttribute("y1", "15.5");
searchIconHandle.setAttribute("x2", "19.5");
searchIconHandle.setAttribute("y2", "19.5");
searchIconHandle.setAttribute("stroke", "currentColor");
searchIconHandle.setAttribute("stroke-width", "1.7");

searchIcon.append(searchIconCircle, searchIconHandle);
searchInputWrapper.append(searchIcon, input);

const searchFeedback = document.createElement("div");
searchFeedback.className = "search-feedback";

const statusRegion = document.createElement("p");
statusRegion.className = "search-status";
statusRegion.setAttribute("role", "status");
statusRegion.setAttribute("aria-live", "polite");
statusRegion.setAttribute("aria-atomic", "true");

const retryButton = document.createElement("button");
retryButton.className = "retry-button";
retryButton.type = "button";
retryButton.textContent = "Retry";
retryButton.hidden = true;
searchFeedback.append(statusRegion, retryButton);

searchPanel.append(label, searchInputWrapper, searchFeedback);
searchStage.append(title, searchPanel);

const results = document.createElement("section");
results.id = "country-results";
results.className = "search-results";
results.setAttribute("aria-label", "Search results");
results.setAttribute("aria-live", "polite");
results.hidden = true;

const detailView = document.createElement("section");
detailView.className = "country-detail";
detailView.hidden = true;

main.append(searchStage, results, detailView);
document.body.append(main);

let activeCardButton: HTMLButtonElement | null = null;

function closeCountryDetails(): void {
  detailView.hidden = true;
  results.hidden = false;
  activeCardButton?.focus();
  activeCardButton = null;
}

function addDetailField(
  list: HTMLDListElement,
  labelText: string,
  value: string,
): void {
  const row = document.createElement("div");
  row.className = "country-detail__row";

  const labelElement = document.createElement("dt");
  labelElement.textContent = labelText;

  const valueElement = document.createElement("dd");
  valueElement.textContent = value;
  row.append(labelElement, valueElement);
  list.append(row);
}

function showCountryDetails(
  country: CountryCardData,
  trigger: HTMLButtonElement,
): void {
  activeCardButton = trigger;

  const backButton = document.createElement("button");
  backButton.className = "detail-back-button";
  backButton.type = "button";
  backButton.textContent = "Back to results";
  backButton.addEventListener("click", closeCountryDetails);

  const heading = document.createElement("div");
  heading.className = "country-detail__heading";

  if (country.flag !== null) {
    const flag = document.createElement("span");
    flag.className = "country-detail__flag";
    flag.setAttribute("aria-hidden", "true");
    flag.textContent = country.flag;
    heading.append(flag);
  }

  const name = document.createElement("h2");
  name.id = "country-detail-title";
  name.className = "country-detail__title";
  name.textContent = country.name;
  heading.append(name);
  detailView.setAttribute("aria-labelledby", name.id);

  const description = document.createElement("p");
  description.className = "country-detail__description";
  description.textContent =
    country.description ?? "Not provided by the data source.";

  const facts = document.createElement("dl");
  facts.className = "country-detail__facts";

  if (country.area !== null) {
    addDetailField(facts, "Area", formatNumber(country.area));
  }
  if (country.borders.length > 0) {
    addDetailField(facts, "Borders", country.borders.join(", "));
  }
  if (country.languages.length > 0) {
    addDetailField(facts, "Languages", country.languages.join(", "));
  }
  if (country.currencies.length > 0) {
    const currencyLabel =
      country.currencies.length === 1 ? "Currency" : "Currencies";
    addDetailField(facts, currencyLabel, country.currencies.join(", "));
  }

  detailView.replaceChildren(backButton, heading, description, facts);
  results.hidden = true;
  detailView.hidden = false;
  backButton.focus();
}

function renderCountryResults(countries: CountryCardData[]): void {
  detailView.hidden = true;
  activeCardButton = null;
  results.replaceChildren();

  if (countries.length === 0) {
    results.hidden = true;
    return;
  }

  for (const country of countries) {
    const card = document.createElement("article");
    card.className = "country-card";

    const button = document.createElement("button");
    button.className = "country-card__button";
    button.type = "button";
    if (country.flag === null) {
      button.classList.add("country-card__button--no-flag");
    }

    if (country.flag !== null) {
      const flag = document.createElement("span");
      flag.className = "country-card__flag";
      flag.setAttribute("aria-hidden", "true");
      flag.textContent = country.flag;
      button.append(flag);
    }

    const name = document.createElement("span");
    name.className = "country-card__name";
    name.textContent = country.name;

    const facts = document.createElement("span");
    facts.className = "country-card__facts";
    const summary = [
      country.capital === null ? null : `Capital: ${country.capital}`,
      country.region === null ? null : `Region: ${country.region}`,
      `Population: ${formatNumber(country.population)}`,
    ];
    facts.textContent = summary.filter((fact) => fact !== null).join(" · ");

    button.append(name, facts);
    button.addEventListener("click", () => {
      showCountryDetails(country, button);
    });
    card.append(button);
    results.append(card);
  }

  results.hidden = false;
}

const handleCountrySearch = createCountrySearchHandler({
  onResults: renderCountryResults,
  onStatus: (message) => {
    statusRegion.textContent = message;
    retryButton.hidden = message !== "Search failed.";
  },
});

input.addEventListener("input", () => {
  handleCountrySearch(input.value);
});

retryButton.addEventListener("click", () => {
  handleCountrySearch(input.value);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !detailView.hidden) {
    event.preventDefault();
    closeCountryDetails();
  }
});
