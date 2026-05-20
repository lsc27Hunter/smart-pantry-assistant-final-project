const addPantryItemBtn = document.getElementById("addPantryItemBtn");
const pantrySearchInput = document.getElementById("pantrySearchInput");
const pantryModal = document.getElementById("pantryModal");
const closePantryModalBtn = document.getElementById("closePantryModalBtn");
const addPantryItemForm = document.getElementById("addPantryItemForm");
const itemNameInput = document.getElementById("itemNameInput");
const itemExpiryInput = document.getElementById("itemExpiryInput");
const itemCategorySelect = document.getElementById("itemCategorySelect");
const recipeViewButtons = document.querySelectorAll(".recipe-view-button");
const expiringSoonBanner = document.getElementById("expiringSoonBanner");
const removeItemModal = document.getElementById("removeItemModal");
const cancelRemoveItemBtn = document.getElementById("cancelRemoveItemBtn");
const usedRemoveItemBtn = document.getElementById("usedRemoveItemBtn");
const wastedRemoveItemBtn = document.getElementById("wastedRemoveItemBtn");
const removeItemPrompt = document.getElementById("removeItemPrompt");
const mealPlanModal = document.getElementById("mealPlanModal");
const mealPlanDateForm = document.getElementById("mealPlanDateForm");
const mealPlanDateInput = document.getElementById("mealPlanDateInput");
const cancelMealPlanBtn = document.getElementById("cancelMealPlanBtn");
const mealPlanRecipePrompt = document.getElementById("mealPlanRecipePrompt");
const pantryDisplay = document.getElementById("pantryDisplay");
const statusMessage = document.getElementById("statusMessage");
const recipesContainer = document.getElementById("recipesContainer");
const mealPlanContainer = document.getElementById("mealPlanContainer");
const prevWeekBtn = document.getElementById("prevWeekBtn");
const thisWeekBtn = document.getElementById("thisWeekBtn");
const nextWeekBtn = document.getElementById("nextWeekBtn");
const mealPlanDateRange = document.getElementById("mealPlanDateRange");
const insightPantryCount = document.getElementById("insightPantryCount");
const insightWastedCount = document.getElementById("insightWastedCount");
const insightMealPlanCount = document.getElementById("insightMealPlanCount");
const insightExpiringCount = document.getElementById("insightExpiringCount");
const wasteChart = document.getElementById("wasteChart");

const API_BASE_URL = "http://localhost:5001";

const tabButtons = document.querySelectorAll(".tab-button");
const tabSections = document.querySelectorAll(".tab-section");

const pantryCount = document.getElementById("pantryCount");

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

let pantryItems = normalizePantryItems(
  JSON.parse(localStorage.getItem("pantryItems")) || []
);
let mealPlan = normalizeMealPlan(JSON.parse(localStorage.getItem("mealPlan")));
let matchedRecipes = [];
let activeRecipeView = "matched";
let favoriteRecipes = normalizeRecipes(
  JSON.parse(localStorage.getItem("favoriteRecipes")) || []
);
let wastedItems = JSON.parse(localStorage.getItem("wastedItems")) || [];
let pendingRemovalItemId = null;
let pendingMealPlanRecipeTitle = "";
let mealPlanWeekOffset = 0;

function makeItemId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createEmptyMealPlan() {
  return {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function formatExpiryDate(isoDate) {
  if (!isoDate) {
    return "No expiry set";
  }

  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "No expiry set";
  }

  return date.toLocaleDateString();
}

function toIsoDate(date) {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getWeekStartMonday(referenceDate = new Date()) {
  const date = new Date(referenceDate);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  return addDays(date, offset);
}

function formatMealPlanDateRange(startDate, endDate) {
  const options = { month: "short", day: "numeric" };
  const startText = startDate.toLocaleDateString("en-US", options);
  const endText = endDate.toLocaleDateString("en-US", options);
  return `${startText} - ${endText}, ${endDate.getFullYear()}`;
}

function normalizeMealPlan(rawMealPlan) {
  const normalizedPlan = createEmptyMealPlan();
  const parsedRaw =
    rawMealPlan && typeof rawMealPlan === "object"
      ? rawMealPlan
      : createEmptyMealPlan();

  const currentWeekStart = getWeekStartMonday(new Date());

  WEEK_DAYS.forEach((dayName, index) => {
    const dayEntries = Array.isArray(parsedRaw[dayName])
      ? parsedRaw[dayName]
      : [];
    const fallbackDate = toIsoDate(addDays(currentWeekStart, index));

    normalizedPlan[dayName] = dayEntries
      .map((entry) => {
        if (typeof entry === "string") {
          return {
            id: makeItemId(),
            title: entry,
            date: fallbackDate,
          };
        }

        if (entry && typeof entry === "object") {
          const title = String(entry.title || entry.name || "").trim();
          if (!title) return null;
          return {
            id: entry.id || makeItemId(),
            title,
            date: entry.date || fallbackDate,
          };
        }

        return null;
      })
      .filter(Boolean);
  });

  localStorage.setItem("mealPlan", JSON.stringify(normalizedPlan));
  return normalizedPlan;
}

function isExpiringSoon(isoDate, daysThreshold = 3) {
  if (!isoDate) {
    return false;
  }

  const expiry = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(expiry.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilExpiry = Math.ceil((expiry - today) / msPerDay);

  return daysUntilExpiry >= 0 && daysUntilExpiry <= daysThreshold;
}

function normalizePantryItems(rawItems) {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((item) => {
      if (typeof item === "string") {
        const normalizedName = item.trim().toLowerCase();
        if (!normalizedName) return null;
        return {
          id: makeItemId(),
          name: normalizedName,
          category: "Other",
          expiryDate: "",
        };
      }

      if (item && typeof item === "object") {
        const normalizedName = String(item.name || "")
          .trim()
          .toLowerCase();
        if (!normalizedName) return null;
        return {
          id: item.id || makeItemId(),
          name: normalizedName,
          category: item.category || "Other",
          expiryDate: item.expiryDate || "",
        };
      }

      return null;
    })
    .filter(Boolean);
}

function normalizeIngredientList(ingredients) {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  return ingredients
    .map((ingredient) => {
      if (typeof ingredient === "string") return ingredient;
      if (ingredient && typeof ingredient === "object") {
        return ingredient.name || "";
      }
      return "";
    })
    .map((name) => name.trim())
    .filter(Boolean);
}

function buildRecipeId(recipe) {
  const rawId = recipe.id || recipe.recipeId;
  if (rawId !== undefined && rawId !== null) {
    return String(rawId);
  }

  const title = String(recipe.title || "recipe")
    .trim()
    .toLowerCase();
  return `title-${title.replace(/\s+/g, "-")}`;
}

function normalizeRecipe(recipe) {
  const normalizedRecipe = {
    ...recipe,
    recipeId: buildRecipeId(recipe),
    title: String(recipe.title || "Untitled Recipe"),
    image: recipe.image || "",
    usedIngredientCount: Number(recipe.usedIngredientCount || 0),
    missedIngredientCount: Number(recipe.missedIngredientCount || 0),
    usedIngredients: normalizeIngredientList(recipe.usedIngredients),
    missedIngredients: normalizeIngredientList(recipe.missedIngredients),
  };

  if (
    !normalizedRecipe.usedIngredientCount &&
    normalizedRecipe.usedIngredients.length
  ) {
    normalizedRecipe.usedIngredientCount =
      normalizedRecipe.usedIngredients.length;
  }

  if (
    !normalizedRecipe.missedIngredientCount &&
    normalizedRecipe.missedIngredients.length
  ) {
    normalizedRecipe.missedIngredientCount =
      normalizedRecipe.missedIngredients.length;
  }

  return normalizedRecipe;
}

function normalizeRecipes(recipes) {
  if (!Array.isArray(recipes)) {
    return [];
  }

  return recipes.map(normalizeRecipe);
}

function isRecipeFavorite(recipeId) {
  return favoriteRecipes.some((recipe) => recipe.recipeId === recipeId);
}

function persistFavorites() {
  localStorage.setItem("favoriteRecipes", JSON.stringify(favoriteRecipes));
}

function openPantryModal() {
  if (!document.getElementById("pantry").classList.contains("active-section")) {
    return;
  }

  pantryModal.classList.add("show");
  pantryModal.setAttribute("aria-hidden", "false");
  itemNameInput.focus();
}

function closePantryModal() {
  pantryModal.classList.remove("show");
  pantryModal.setAttribute("aria-hidden", "true");
  addPantryItemForm.reset();
}

function openRemoveItemModal(itemIdToDelete) {
  const itemToDelete = pantryItems.find((item) => item.id === itemIdToDelete);
  if (!itemToDelete) {
    return;
  }

  pendingRemovalItemId = itemIdToDelete;
  removeItemPrompt.textContent = `Remove ${capitalize(itemToDelete.name)}?`;
  removeItemModal.classList.add("show");
  removeItemModal.setAttribute("aria-hidden", "false");
}

function closeRemoveItemModal() {
  removeItemModal.classList.remove("show");
  removeItemModal.setAttribute("aria-hidden", "true");
  pendingRemovalItemId = null;
}

function getTodayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

function getWeekdayNameFromIsoDate(isoDate) {
  const parsedDate = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-US", { weekday: "long" });
}

function openMealPlanModal(recipeTitle) {
  pendingMealPlanRecipeTitle = recipeTitle;
  mealPlanRecipePrompt.textContent = `Add ${recipeTitle} to your meal plan`;
  mealPlanDateInput.min = getTodayIsoDate();
  mealPlanDateInput.value = "";

  mealPlanModal.classList.add("show");
  mealPlanModal.setAttribute("aria-hidden", "false");
}

function closeMealPlanModal() {
  mealPlanModal.classList.remove("show");
  mealPlanModal.setAttribute("aria-hidden", "true");
  mealPlanDateForm.reset();
  pendingMealPlanRecipeTitle = "";
}

function saveRecipeToMealPlanByDate(event) {
  event.preventDefault();

  if (!pendingMealPlanRecipeTitle) {
    return;
  }

  const selectedDate = mealPlanDateInput.value;
  if (!selectedDate) {
    return;
  }

  const dayName = getWeekdayNameFromIsoDate(selectedDate);
  if (!dayName || !mealPlan[dayName]) {
    return;
  }

  mealPlan[dayName].push({
    id: makeItemId(),
    title: pendingMealPlanRecipeTitle,
    date: selectedDate,
  });
  localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
  renderMealPlan();
  renderInsights();
  closeMealPlanModal();
}

function removePantryItemById(itemIdToDelete) {
  pantryItems = pantryItems.filter((item) => item.id !== itemIdToDelete);
  localStorage.setItem("pantryItems", JSON.stringify(pantryItems));
  renderPantry();
  renderInsights();
  refreshMatchedRecipesIfOpen();
}

function markPendingItemAsUsed() {
  if (!pendingRemovalItemId) {
    return;
  }

  removePantryItemById(pendingRemovalItemId);
  closeRemoveItemModal();
}

function markPendingItemAsWasted() {
  if (!pendingRemovalItemId) {
    return;
  }

  const itemToWaste = pantryItems.find(
    (item) => item.id === pendingRemovalItemId
  );
  if (!itemToWaste) {
    closeRemoveItemModal();
    return;
  }

  wastedItems.push({
    id: itemToWaste.id,
    name: itemToWaste.name,
    category: itemToWaste.category,
    expiryDate: itemToWaste.expiryDate,
    wastedAt: new Date().toISOString(),
  });
  localStorage.setItem("wastedItems", JSON.stringify(wastedItems));
  renderInsights();

  removePantryItemById(pendingRemovalItemId);
  closeRemoveItemModal();
}

function getFilteredPantryItems() {
  const query = pantrySearchInput.value.trim().toLowerCase();

  if (!query) {
    return pantryItems;
  }

  return pantryItems.filter((item) => {
    const searchableText = `${item.name} ${item.category}`.toLowerCase();
    return searchableText.includes(query);
  });
}

function renderPantry() {
  pantryCount.textContent = `${pantryItems.length} items tracked`;
  const filteredItems = getFilteredPantryItems();
  const expiringSoonItems = pantryItems.filter((item) =>
    isExpiringSoon(item.expiryDate)
  );

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

function renderActiveRecipes() {
  const recipesToRender =
    activeRecipeView === "matched" ? matchedRecipes : favoriteRecipes;

  if (!recipesToRender.length) {
    recipesContainer.innerHTML =
      activeRecipeView === "matched"
        ? "<p>No matched recipes yet.</p>"
        : "<p>No favorites yet. Heart a matched recipe to save it.</p>";
    return;
  }

  recipesContainer.innerHTML = recipesToRender
    .map((recipe) => {
      const totalIngredients =
        recipe.usedIngredientCount + recipe.missedIngredientCount;
      const matchPercent = totalIngredients
        ? Math.round((recipe.usedIngredientCount / totalIngredients) * 100)
        : 0;

      const favorite = isRecipeFavorite(recipe.recipeId);
      const encodedRecipeTitle = encodeURIComponent(recipe.title);

      return `
        <article class="recipe-card">
          <img src="${recipe.image}" alt="${recipe.title}" />
          <div class="recipe-content">
            <div class="recipe-title-row">
              <h3>${recipe.title}</h3>
              <button
                class="recipe-heart-btn ${favorite ? "is-favorite" : ""}"
                type="button"
                data-recipe-id="${recipe.recipeId}"
                aria-label="Toggle favorite"
              >
                <iconify-icon
                  icon="${favorite ? "mdi:heart" : "mdi:heart-outline"}"
                ></iconify-icon>
              </button>
            </div>
            <p><strong>Pantry Match:</strong> ${matchPercent}%</p>
            <p><strong>Used:</strong> ${recipe.usedIngredients.join(", ") || "None"}</p>
            <p><strong>Missing:</strong> ${recipe.missedIngredients.join(", ") || "None"}</p>
            <button
              class="recipe-add-meal-btn"
              type="button"
              data-recipe-title="${encodedRecipeTitle}"
            >
              Add to Meal Plan
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderRecipesLoadingState() {
  recipesContainer.innerHTML = `
    <div class="recipe-loading-state" role="status" aria-live="polite">
      <span class="recipe-spinner" aria-hidden="true"></span>
      <p>Loading matched recipes...</p>
    </div>
  `;
}

function toggleFavoriteRecipe(recipeId) {
  const existingFavoriteIndex = favoriteRecipes.findIndex(
    (recipe) => recipe.recipeId === recipeId
  );

  if (existingFavoriteIndex >= 0) {
    favoriteRecipes.splice(existingFavoriteIndex, 1);
    persistFavorites();
    renderActiveRecipes();
    return;
  }

  const matchedRecipe = matchedRecipes.find(
    (recipe) => recipe.recipeId === recipeId
  );
  if (!matchedRecipe) {
    return;
  }

  favoriteRecipes.push(matchedRecipe);
  persistFavorites();
  renderActiveRecipes();
}

async function searchRecipes() {
  if (activeRecipeView !== "matched") {
    return;
  }

  if (!pantryItems.length) {
    matchedRecipes = [];
    statusMessage.textContent = "Add pantry items to discover matched recipes.";
    renderActiveRecipes();
    return;
  }

  statusMessage.textContent = "Loading matched recipes...";
  renderRecipesLoadingState();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/recipes?ingredients=${encodeURIComponent(
        pantryItems.map((item) => item.name).join(",")
      )}`
    );

    const recipes = normalizeRecipes(await response.json());
    matchedRecipes = recipes;

    if (!matchedRecipes.length) {
      statusMessage.textContent = "No matched recipes found.";
      renderActiveRecipes();
      return;
    }

    statusMessage.textContent = "";
    renderActiveRecipes();
  } catch (error) {
    console.error(error);
    matchedRecipes = [];
    statusMessage.textContent = "Something went wrong fetching recipes.";
    renderActiveRecipes();
  }
}

function setRecipeView(view) {
  activeRecipeView = view;
  recipeViewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.recipeView === view);
  });

  if (view === "favorites") {
    statusMessage.textContent = "";
    renderActiveRecipes();
    return;
  }

  searchRecipes();
}

function refreshMatchedRecipesIfOpen() {
  if (
    document.getElementById("recipes").classList.contains("active-section") &&
    activeRecipeView === "matched"
  ) {
    searchRecipes();
  }
}

function savePantryItem(event) {
  event.preventDefault();

  const name = itemNameInput.value.trim().toLowerCase();
  const category = itemCategorySelect.value;
  const expiryDate = itemExpiryInput.value;

  if (!name) {
    return;
  }

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

  localStorage.setItem("pantryItems", JSON.stringify(pantryItems));
  renderPantry();
  renderInsights();
  refreshMatchedRecipesIfOpen();
  closePantryModal();
}

function deletePantryItem(itemIdToDelete) {
  openRemoveItemModal(itemIdToDelete);
}

function removeMealPlanEntry(dayName, mealId) {
  if (!mealPlan[dayName]) {
    return;
  }

  mealPlan[dayName] = mealPlan[dayName].filter((entry) => entry.id !== mealId);
  localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
  renderMealPlan();
  renderInsights();
}

function getLast7Days() {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i -= 1) {
    dates.push(addDays(today, -i));
  }

  return dates;
}

function renderWasteChart() {
  if (!wasteChart) {
    return;
  }

  const ctx = wasteChart.getContext("2d");
  if (!ctx) {
    return;
  }

  const dates = getLast7Days();
  const labels = dates.map((date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );
  const counts = dates.map((date) => {
    const isoDate = toIsoDate(date);
    return wastedItems.filter((item) => {
      if (!item || !item.wastedAt) {
        return false;
      }

      return toIsoDate(new Date(item.wastedAt)) === isoDate;
    }).length;
  });

  const width = wasteChart.width;
  const height = wasteChart.height;
  ctx.clearRect(0, 0, width, height);

  const left = 44;
  const right = 16;
  const top = 18;
  const bottom = 40;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  const maxCount = Math.max(1, ...counts);
  const barGap = 10;
  const barWidth = (chartWidth - barGap * (counts.length - 1)) / counts.length;

  ctx.fillStyle = "#6b5b18";
  counts.forEach((count, index) => {
    const barHeight = (count / maxCount) * chartHeight;
    const x = left + index * (barWidth + barGap);
    const y = top + (chartHeight - barHeight);

    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(String(count), x + barWidth / 2, y - 6);
    ctx.fillStyle = "#6b5b18";
  });

  ctx.fillStyle = "#555";
  ctx.font = "11px Arial";
  ctx.textAlign = "center";
  labels.forEach((label, index) => {
    const x = left + index * (barWidth + barGap) + barWidth / 2;
    ctx.fillText(label, x, height - 16);
  });

  ctx.strokeStyle = "#cfcfcf";
  ctx.beginPath();
  ctx.moveTo(left, top + chartHeight);
  ctx.lineTo(width - right, top + chartHeight);
  ctx.stroke();
}

function renderInsights() {
  if (!insightPantryCount) {
    return;
  }

  const pantryCountValue = pantryItems.length;
  const wastedCountValue = wastedItems.length;
  const mealPlanCountValue = WEEK_DAYS.reduce((sum, dayName) => {
    return sum + (mealPlan[dayName] || []).length;
  }, 0);
  const expiringCountValue = pantryItems.filter((item) =>
    isExpiringSoon(item.expiryDate)
  ).length;

  insightPantryCount.textContent = String(pantryCountValue);
  insightWastedCount.textContent = String(wastedCountValue);
  insightMealPlanCount.textContent = String(mealPlanCountValue);
  insightExpiringCount.textContent = String(expiringCountValue);

  renderWasteChart();
}

function renderMealPlan() {
  const today = new Date();
  const todayIso = toIsoDate(today);
  const weekStart = addDays(getWeekStartMonday(today), mealPlanWeekOffset * 7);
  const weekEnd = addDays(weekStart, 6);

  mealPlanDateRange.textContent = formatMealPlanDateRange(weekStart, weekEnd);

  mealPlanContainer.innerHTML = WEEK_DAYS.map((dayName, index) => {
    const dateForDay = addDays(weekStart, index);
    const dateIso = toIsoDate(dateForDay);
    const dayMeals = (mealPlan[dayName] || []).filter(
      (meal) => meal.date === dateIso
    );

    return `
      <div class="day-card ${dateIso === todayIso ? "today-day-card" : ""}">
        <div class="day-card-header">
          <h3>${dayName}</h3>
          ${dateIso === todayIso ? '<span class="today-label">Today</span>' : ""}
        </div>
        <p class="day-card-date">${dateForDay.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
        ${
          dayMeals.length
            ? dayMeals
                .map(
                  (meal) => `
                    <div class="meal-plan-item">
                      <p>${meal.title}</p>
                      <button
                        class="remove-meal-btn"
                        type="button"
                        data-meal-day="${dayName}"
                        data-meal-id="${meal.id}"
                        aria-label="Remove meal"
                        title="Remove meal"
                      >
                        <iconify-icon icon="solar:trash-bin-trash-outline"></iconify-icon>
                      </button>
                    </div>
                  `
                )
                .join("")
            : '<p class="meal-plan-empty">No meals planned.</p>'
        }
      </div>
    `;
  }).join("");
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedTab = button.dataset.tab;

    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabSections.forEach((section) => {
      section.classList.remove("active-section");
    });

    button.classList.add("active");
    document.getElementById(selectedTab).classList.add("active-section");

    if (selectedTab !== "pantry") {
      closePantryModal();
    }

    if (selectedTab === "recipes") {
      setRecipeView(activeRecipeView);
    }
  });
});

addPantryItemBtn.addEventListener("click", openPantryModal);
closePantryModalBtn.addEventListener("click", closePantryModal);
addPantryItemForm.addEventListener("submit", savePantryItem);
pantrySearchInput.addEventListener("input", renderPantry);

recipeViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setRecipeView(button.dataset.recipeView);
  });
});

recipesContainer.addEventListener("click", (event) => {
  const heartButton = event.target.closest(".recipe-heart-btn");
  if (heartButton) {
    toggleFavoriteRecipe(heartButton.dataset.recipeId);
    return;
  }

  const addToMealButton = event.target.closest(".recipe-add-meal-btn");
  if (!addToMealButton) {
    return;
  }

  const recipeTitle = decodeURIComponent(
    addToMealButton.dataset.recipeTitle || ""
  );
  if (!recipeTitle) {
    return;
  }

  openMealPlanModal(recipeTitle);
});

pantryModal.addEventListener("click", (event) => {
  if (event.target === pantryModal) {
    closePantryModal();
  }
});

removeItemModal.addEventListener("click", (event) => {
  if (event.target === removeItemModal) {
    closeRemoveItemModal();
  }
});

mealPlanModal.addEventListener("click", (event) => {
  if (event.target === mealPlanModal) {
    closeMealPlanModal();
  }
});

mealPlanContainer.addEventListener("click", (event) => {
  const removeMealButton = event.target.closest(".remove-meal-btn");
  if (!removeMealButton) {
    return;
  }

  const dayName = removeMealButton.dataset.mealDay;
  const mealId = removeMealButton.dataset.mealId;
  if (!dayName || !mealId) {
    return;
  }

  removeMealPlanEntry(dayName, mealId);
});

cancelRemoveItemBtn.addEventListener("click", closeRemoveItemModal);
usedRemoveItemBtn.addEventListener("click", markPendingItemAsUsed);
wastedRemoveItemBtn.addEventListener("click", markPendingItemAsWasted);
cancelMealPlanBtn.addEventListener("click", closeMealPlanModal);
mealPlanDateForm.addEventListener("submit", saveRecipeToMealPlanByDate);
prevWeekBtn.addEventListener("click", () => {
  mealPlanWeekOffset -= 1;
  renderMealPlan();
});
thisWeekBtn.addEventListener("click", () => {
  mealPlanWeekOffset = 0;
  renderMealPlan();
});
nextWeekBtn.addEventListener("click", () => {
  mealPlanWeekOffset += 1;
  renderMealPlan();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  if (pantryModal.classList.contains("show")) {
    closePantryModal();
  }

  if (removeItemModal.classList.contains("show")) {
    closeRemoveItemModal();
  }

  if (mealPlanModal.classList.contains("show")) {
    closeMealPlanModal();
  }
});

renderPantry();
renderMealPlan();
renderActiveRecipes();
renderInsights();
