import { createCountrySearchHandler } from "./searchController.js";
import { loadSearchHistory, recordSearchHistory } from "./searchHistory.js";
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
input.autocomplete = "off";
input.setAttribute("aria-controls", "country-results");

const svgNamespace = "http://www.w3.org/2000/svg";
const searchIcon = document.createElementNS(svgNamespace, "svg");
searchIcon.classList.add("search-input-icon");
searchIcon.setAttribute("viewBox", "0 0 24 24");
searchIcon.setAttribute("aria-hidden", "true");
searchIcon.setAttribute("focusable", "false");

const searchIconLine = document.createElementNS(svgNamespace, "line");
searchIconLine.setAttribute("x1", "5");
searchIconLine.setAttribute("y1", "12");
searchIconLine.setAttribute("x2", "19");
searchIconLine.setAttribute("y2", "12");
searchIconLine.setAttribute("stroke", "currentColor");
searchIconLine.setAttribute("stroke-width", "1.7");
searchIconLine.setAttribute("stroke-linecap", "round");

const searchIconChevron = document.createElementNS(svgNamespace, "polyline");
searchIconChevron.setAttribute("points", "13 6 19 12 13 18");
searchIconChevron.setAttribute("fill", "none");
searchIconChevron.setAttribute("stroke", "currentColor");
searchIconChevron.setAttribute("stroke-width", "1.7");
searchIconChevron.setAttribute("stroke-linecap", "round");
searchIconChevron.setAttribute("stroke-linejoin", "round");

searchIcon.append(searchIconLine, searchIconChevron);

const clearButton = document.createElement("button");
clearButton.className = "search-clear-button";
clearButton.type = "button";
clearButton.setAttribute("aria-label", "Clear search");
clearButton.hidden = true;

const clearIcon = document.createElementNS(svgNamespace, "svg");
clearIcon.classList.add("search-clear-icon");
clearIcon.setAttribute("viewBox", "0 0 24 24");
clearIcon.setAttribute("aria-hidden", "true");
clearIcon.setAttribute("focusable", "false");

const clearIconLineOne = document.createElementNS(svgNamespace, "line");
clearIconLineOne.setAttribute("x1", "7");
clearIconLineOne.setAttribute("y1", "7");
clearIconLineOne.setAttribute("x2", "17");
clearIconLineOne.setAttribute("y2", "17");
clearIconLineOne.setAttribute("stroke", "currentColor");
clearIconLineOne.setAttribute("stroke-width", "1.7");
clearIconLineOne.setAttribute("stroke-linecap", "round");

const clearIconLineTwo = document.createElementNS(svgNamespace, "line");
clearIconLineTwo.setAttribute("x1", "17");
clearIconLineTwo.setAttribute("y1", "7");
clearIconLineTwo.setAttribute("x2", "7");
clearIconLineTwo.setAttribute("y2", "17");
clearIconLineTwo.setAttribute("stroke", "currentColor");
clearIconLineTwo.setAttribute("stroke-width", "1.7");
clearIconLineTwo.setAttribute("stroke-linecap", "round");

clearIcon.append(clearIconLineOne, clearIconLineTwo);
clearButton.append(clearIcon);
searchInputWrapper.append(searchIcon, input, clearButton);

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

const searchHistorySection = document.createElement("section");
searchHistorySection.className = "search-history";
searchHistorySection.setAttribute("aria-label", "Recent searches");
searchHistorySection.hidden = true;

const searchHistoryHeading = document.createElement("h2");
searchHistoryHeading.className = "search-history__title";
searchHistoryHeading.textContent = "Recent searches";

const searchHistoryList = document.createElement("ul");
searchHistoryList.className = "search-history__list";
searchHistorySection.append(searchHistoryHeading, searchHistoryList);

searchPanel.append(
  label,
  searchInputWrapper,
  searchFeedback,
  searchHistorySection,
);
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

  const flag = document.createElement("span");
  flag.className = "country-detail__flag";
  if (country.flag) {
    flag.setAttribute("aria-hidden", "true");
    flag.textContent = country.flag;
  } else {
    flag.textContent = "—";
  }
  heading.append(flag);

  const name = document.createElement("h2");
  name.id = "country-detail-title";
  name.className = "country-detail__title";
  name.textContent = country.name || "—";
  heading.append(name);
  detailView.setAttribute("aria-labelledby", name.id);

  const description = document.createElement("p");
  description.className = "country-detail__description";
  description.textContent = country.description || "—";

  const facts = document.createElement("dl");
  facts.className = "country-detail__facts";

  addDetailField(
    facts,
    "Area",
    country.area === null ? "—" : formatNumber(country.area),
  );
  addDetailField(
    facts,
    "Borders",
    country.borders.length === 0 ? "—" : country.borders.join(", "),
  );
  addDetailField(
    facts,
    "Languages",
    country.languages.length === 0 ? "—" : country.languages.join(", "),
  );
  const currencyLabel =
    country.currencies.length === 1 ? "Currency" : "Currencies";
  addDetailField(
    facts,
    currencyLabel,
    country.currencies.length === 0 ? "—" : country.currencies.join(", "),
  );

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
    if (!country.flag) {
      button.classList.add("country-card__button--no-flag");
    }

    const flag = document.createElement("span");
    flag.className = "country-card__flag";
    if (country.flag) {
      flag.setAttribute("aria-hidden", "true");
      flag.textContent = country.flag;
    } else {
      flag.textContent = "—";
    }
    button.append(flag);

    const name = document.createElement("span");
    name.className = "country-card__name";
    name.textContent = country.name || "—";

    const facts = document.createElement("span");
    facts.className = "country-card__facts";
    const summary = [
      `Capital: ${country.capital || "—"}`,
      `Region: ${country.region || "—"}`,
      `Population: ${
        country.population === null ? "—" : formatNumber(country.population)
      }`,
    ];
    facts.textContent = summary.join(" · ");

    button.append(name, facts);
    button.addEventListener("click", () => {
      showCountryDetails(country, button);
    });
    card.append(button);
    results.append(card);
  }

  results.hidden = false;
}

let searchHistory = loadSearchHistory();

function renderSearchHistory(): void {
  searchHistoryList.replaceChildren();
  searchHistorySection.hidden = searchHistory.length === 0;

  for (const query of searchHistory) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.className = "search-history__button";
    button.type = "button";
    button.textContent = query;
    button.addEventListener("click", () => {
      input.value = query;
      clearButton.hidden = false;
      handleCountrySearch(query, true);
    });
    item.append(button);
    searchHistoryList.append(item);
  }
}

const handleCountrySearch = createCountrySearchHandler({
  onResults: renderCountryResults,
  onStatus: (message) => {
    statusRegion.textContent = message;
    retryButton.hidden = message !== "Search failed.";
  },
  onSearch: (query) => {
    searchHistory = recordSearchHistory(query, searchHistory);
    renderSearchHistory();
  },
});

renderSearchHistory();

input.addEventListener("input", () => {
  clearButton.hidden = input.value.trim() === "";
  handleCountrySearch(input.value);
});

clearButton.addEventListener("click", () => {
  input.value = "";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.focus();
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
