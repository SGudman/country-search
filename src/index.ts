const header = document.createElement("header");
header.className = "site-header";

const title = document.createElement("h1");
title.textContent = "Country Search";
header.append(title);

const main = document.createElement("main");
main.className = "country-search-main";

const searchPanel = document.createElement("section");
searchPanel.className = "search-panel";
searchPanel.setAttribute("aria-labelledby", "country-search-label");

const label = document.createElement("label");
label.id = "country-search-label";
label.htmlFor = "country-search-input";
label.textContent = "Search countries";

const input = document.createElement("input");
input.id = "country-search-input";
input.className = "country-search-input";
input.name = "country";
input.type = "search";
input.autocomplete = "off";
input.setAttribute("aria-controls", "country-results");

const statusRegion = document.createElement("p");
statusRegion.className = "search-status";
statusRegion.setAttribute("role", "status");
statusRegion.setAttribute("aria-live", "polite");
statusRegion.setAttribute("aria-atomic", "true");

const results = document.createElement("section");
results.id = "country-results";
results.className = "search-results";
results.setAttribute("aria-label", "Search results");
results.setAttribute("aria-live", "polite");

searchPanel.append(label, input, statusRegion, results);
main.append(searchPanel);
document.body.append(header, main);
