class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="app-header">
        <div class="app-header-content">
          <div class="app-header-icon-wrapper">
            <iconify-icon class="app-header-icon" icon="mdi:chef-hat"></iconify-icon>
          </div>

          <div class="app-header-text">
            <h1>Smart Pantry Assistant</h1>
            <p class="app-header-caption">
              Find recipe ideas using ingredients you already have.
            </p>
          </div>
        </div>
      </header>
    `;
  }
}

class AppTabBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="tab-bar">
        <button class="tab-button active" data-tab="pantry">
          <iconify-icon icon="solar:box-linear"></iconify-icon>Pantry
        </button>
        <button class="tab-button" data-tab="recipes">
          <iconify-icon icon="mdi:chef-hat"></iconify-icon>Recipes
        </button>
        <button class="tab-button" data-tab="mealPlan">
          <iconify-icon icon="lucide:calendar"></iconify-icon>Meal Plan
        </button>
        <button class="tab-button" data-tab="insights">
          <iconify-icon icon="codicon:graph"></iconify-icon>Insights
        </button>
      </nav>
    `;
  }
}

class PantrySection extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section id="pantry" class="tab-section active-section card">
        <h2>
          My Pantry
          <p id="pantryCount" class="section-caption"></p>
        </h2>
        <div id="expiringSoonBanner" class="expiring-soon-banner"></div>
        <div class="pantry-actions-row">
          <input
            id="pantrySearchInput"
            type="search"
            placeholder="Search pantry items"
            aria-label="Search pantry items"
          />
          <button id="addPantryItemBtn" type="button">Add Item</button>
        </div>
        <div id="pantryDisplay"></div>
      </section>
    `;
  }
}

class PantryModals extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div id="pantryModal" class="modal-overlay" aria-hidden="true">
        <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <div class="modal-header">
            <h3 id="modalTitle">Add Pantry Item</h3>
            <button
              id="closePantryModalBtn"
              class="modal-close-btn"
              type="button"
              aria-label="Close add item modal"
            >
              Close
            </button>
          </div>

          <form id="addPantryItemForm" class="modal-form">
            <label for="itemNameInput">Item Name</label>
            <input id="itemNameInput" type="text" required placeholder="e.g. Spinach" />

            <label for="itemExpiryInput">Expiry Date (Optional)</label>
            <input id="itemExpiryInput" type="date" />

            <label for="itemCategorySelect">Category</label>
            <select id="itemCategorySelect" required>
              <option value="Produce">Produce</option>
              <option value="Protein">Protein</option>
              <option value="Dairy">Dairy</option>
              <option value="Grains">Grains</option>
              <option value="Spices">Spices</option>
              <option value="Canned Goods">Canned Goods</option>
              <option value="Frozen">Frozen</option>
              <option value="Beverages">Beverages</option>
              <option value="Other">Other</option>
            </select>

            <button type="submit">Save Item</button>
          </form>
        </div>
      </div>

      <div id="removeItemModal" class="modal-overlay" aria-hidden="true">
        <div
          class="modal-content remove-item-modal-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="removeItemTitle"
        >
          <div class="modal-header">
            <h3 id="removeItemTitle"></h3>
          </div>

          <div class="remove-item-body">
            <p id="removeItemPrompt" class="remove-item-prompt"></p>
            <p class="remove-item-subtext">Did you use this item or is it going to waste?</p>
          </div>

          <div class="remove-item-actions">
            <button id="cancelRemoveItemBtn" type="button">Cancel</button>
            <button id="usedRemoveItemBtn" type="button">Used It</button>
            <button id="wastedRemoveItemBtn" type="button">Wasted It</button>
          </div>
        </div>
      </div>

      <div id="mealPlanModal" class="modal-overlay" aria-hidden="true">
        <div
          class="modal-content meal-plan-modal-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mealPlanModalTitle"
        >
          <div class="modal-header">
            <h3 id="mealPlanModalTitle">Add to Meal Plan</h3>
          </div>

          <form id="mealPlanDateForm" class="modal-form">
            <p id="mealPlanRecipePrompt" class="remove-item-prompt"></p>

            <label for="mealPlanDateInput">Pick a date</label>
            <input id="mealPlanDateInput" type="date" required />

            <div class="meal-plan-modal-actions">
              <button id="cancelMealPlanBtn" type="button">Cancel</button>
              <button id="saveMealPlanDateBtn" type="submit">Add to Plan</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}

class RecipesSection extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section id="recipes" class="tab-section card">
        <h2>Recipe Finder</h2>
        <p class="recipe-finder-caption">Discover recipes based on your pantry items</p>

        <div class="recipe-view-tabs" role="tablist" aria-label="Recipe views">
          <button class="recipe-view-button active" type="button" data-recipe-view="matched">
            Matched Recipes
          </button>
          <button class="recipe-view-button" type="button" data-recipe-view="favorites">
            Favorites
          </button>
        </div>

        <p id="statusMessage"></p>
        <div id="recipesContainer" class="recipe-grid"></div>
      </section>
    `;
  }
}

class MealPlanSection extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section id="mealPlan" class="tab-section card">
        <h2>Meal Planner</h2>
        <p class="meal-planner-caption">Plan your meals for the week ahead</p>
        <div class="meal-plan-toolbar">
          <div class="meal-plan-week-switch" role="group" aria-label="Week switcher">
            <button id="prevWeekBtn" type="button">Previous</button>
            <button id="thisWeekBtn" type="button">This Week</button>
            <button id="nextWeekBtn" type="button">Next</button>
          </div>
          <p id="mealPlanDateRange" class="meal-plan-date-range"></p>
        </div>
        <div id="mealPlanContainer" class="meal-plan-grid"></div>
      </section>
    `;
  }
}

class InsightsSection extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section id="insights" class="tab-section card">
        <h2>Insights &amp; Analytics</h2>
        <p class="insights-caption">Track your food usage and reduce waste</p>

        <div class="insights-stats-grid">
          <article class="insight-stat-card">
            <h3>Pantry Items</h3>
            <p id="insightPantryCount" class="insight-stat-value">0</p>
            <p class="insight-stat-label">items tracked</p>
          </article>

          <article class="insight-stat-card">
            <h3>Wasted Items</h3>
            <p id="insightWastedCount" class="insight-stat-value">0</p>
            <p class="insight-stat-label">total logged</p>
          </article>

          <article class="insight-stat-card">
            <h3>Meal Plans</h3>
            <p id="insightMealPlanCount" class="insight-stat-value">0</p>
            <p class="insight-stat-label">meals scheduled</p>
          </article>

          <article class="insight-stat-card">
            <h3>Expiring Soon</h3>
            <p id="insightExpiringCount" class="insight-stat-value">0</p>
            <p class="insight-stat-label">use within 3 days</p>
          </article>
        </div>

        <div class="insights-chart-card">
          <h3>Food Waste - Last 7 Days</h3>
          <canvas id="wasteChart" width="900" height="260" aria-label="Food waste chart"></canvas>
        </div>
      </section>
    `;
  }
}

customElements.define("app-header", AppHeader);
customElements.define("app-tab-bar", AppTabBar);
customElements.define("pantry-section", PantrySection);
customElements.define("pantry-modals", PantryModals);
customElements.define("recipes-section", RecipesSection);
customElements.define("mealplan-section", MealPlanSection);
customElements.define("insights-section", InsightsSection);
