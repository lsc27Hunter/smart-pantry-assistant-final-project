// Pantry logic module
// Handles pantry item CRUD, search, and rendering

import {
  makeItemId,
  capitalize,
  formatExpiryDate,
  isExpiringSoon,
  normalizePantryItems,
} from "./utils.js";

let pantryItems = normalizePantryItems(
  JSON.parse(localStorage.getItem("pantryItems")) || []
);
let wastedItems = JSON.parse(localStorage.getItem("wastedItems")) || [];

export function getPantryItems() {
  return pantryItems;
}

export function setPantryItems(items) {
  pantryItems = items;
  localStorage.setItem("pantryItems", JSON.stringify(pantryItems));
}

export function getWastedItems() {
  return wastedItems;
}

export function setWastedItems(items) {
  wastedItems = items;
  localStorage.setItem("wastedItems", JSON.stringify(wastedItems));
}

export function addPantryItem({ name, category, expiryDate }) {
  const existingItem = pantryItems.find((item) => item.name === name);
  if (existingItem) {
    existingItem.category = category;
    existingItem.expiryDate = expiryDate;
  } else {
    pantryItems.push({
      id: makeItemId(),
      name,
      category,
      expiryDate,
    });
  }
  setPantryItems(pantryItems);
}

export function removePantryItemById(itemIdToDelete) {
  pantryItems = pantryItems.filter((item) => item.id !== itemIdToDelete);
  setPantryItems(pantryItems);
}

export function markItemAsWasted(itemId) {
  const itemToWaste = pantryItems.find((item) => item.id === itemId);
  if (!itemToWaste) return;
  wastedItems.push({
    ...itemToWaste,
    wastedAt: new Date().toISOString(),
  });
  setWastedItems(wastedItems);
  removePantryItemById(itemId);
}

export function getFilteredPantryItems(query) {
  if (!query) return pantryItems;
  return pantryItems.filter((item) => {
    const searchableText = `${item.name} ${item.category}`.toLowerCase();
    return searchableText.includes(query.toLowerCase());
  });
}

export function getExpiringSoonItems() {
  return pantryItems.filter((item) => isExpiringSoon(item.expiryDate));
}

export function renderPantry({
  pantryDisplay,
  pantryCount,
  expiringSoonBanner,
  pantrySearchInput,
}) {
  pantryCount.textContent = `${pantryItems.length} items tracked`;
  const filteredItems = getFilteredPantryItems(pantrySearchInput.value);
  const expiringSoonItems = getExpiringSoonItems();

  if (expiringSoonItems.length) {
    const expiringItemNames = expiringSoonItems
      .map((item) => capitalize(item.name))
      .join(", ");
    expiringSoonBanner.textContent = `${expiringSoonItems.length} item(s) expiring soon. Use these items first: ${expiringItemNames}`;
    expiringSoonBanner.classList.add("show");
  } else {
    expiringSoonBanner.textContent = "";
    expiringSoonBanner.classList.remove("show");
  }

  pantryDisplay.innerHTML = filteredItems.length
    ? `
      <div class="pantry-grid">
        ${filteredItems
          .map((item) => {
            const expiringSoon = isExpiringSoon(item.expiryDate);
            const cardClass = expiringSoon
              ? "pantry-card bg-yellow-50"
              : "pantry-card";
            return `
              <article class="${cardClass}">
                <div class="pantry-card-header">
                  <h3>
                    ${capitalize(item.name)}
                    ${
                      expiringSoon
                        ? '<span class="pantry-expiring-indicator" aria-label="Expiring soon"></span>'
                        : ""
                    }
                  </h3>
                  <iconify-icon
                    class="delete-icon"
                    icon="solar:trash-bin-trash-outline"
                    onclick="deletePantryItem('${item.id}')"
                  ></iconify-icon>
                </div>
                <div class="pantry-badges">
                  <span class="badge">${item.category}</span>
                  <span class="badge">${
                    item.expiryDate
                      ? `Expires ${formatExpiryDate(item.expiryDate)}`
                      : "Expiry Date Not Set"
                  }</span>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `
    : pantryItems.length
      ? "No matching pantry items found."
      : "No pantry items saved yet.";
}
