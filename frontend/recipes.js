// Recipes logic module
// Handles recipe search, favorites, and rendering

import { normalizeRecipes, buildRecipeId } from "./recipes-utils.js";

let matchedRecipes = [];
let favoriteRecipes = normalizeRecipes(
  JSON.parse(localStorage.getItem("favoriteRecipes")) || []
);
let activeRecipeView = "matched";

export function getMatchedRecipes() {
  return matchedRecipes;
}

export function setMatchedRecipes(recipes) {
  matchedRecipes = recipes;
}

export function getFavoriteRecipes() {
  return favoriteRecipes;
}

export function setFavoriteRecipes(recipes) {
  favoriteRecipes = recipes;
  localStorage.setItem("favoriteRecipes", JSON.stringify(favoriteRecipes));
}

export function isRecipeFavorite(recipeId) {
  return favoriteRecipes.some((recipe) => recipe.recipeId === recipeId);
}

export function toggleFavoriteRecipe(recipeId) {
  const existingFavoriteIndex = favoriteRecipes.findIndex(
    (recipe) => recipe.recipeId === recipeId
  );
  if (existingFavoriteIndex >= 0) {
    favoriteRecipes.splice(existingFavoriteIndex, 1);
    setFavoriteRecipes(favoriteRecipes);
    return;
  }
  const matchedRecipe = matchedRecipes.find(
    (recipe) => recipe.recipeId === recipeId
  );
  if (!matchedRecipe) {
    return;
  }
  favoriteRecipes.push(matchedRecipe);
  setFavoriteRecipes(favoriteRecipes);
}

export function setActiveRecipeView(view) {
  activeRecipeView = view;
}

export function getActiveRecipeView() {
  return activeRecipeView;
}

export async function searchRecipes(
  pantryItems,
  API_BASE_URL,
  statusMessage,
  renderRecipesLoadingState,
  renderActiveRecipes
) {
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
