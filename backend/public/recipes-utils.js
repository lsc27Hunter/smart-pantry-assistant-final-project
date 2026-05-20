// Recipes utility functions for normalization and IDs

export function buildRecipeId(recipe) {
  const rawId = recipe.id || recipe.recipeId;
  if (rawId !== undefined && rawId !== null) {
    return String(rawId);
  }
  const title = String(recipe.title || "recipe")
    .trim()
    .toLowerCase();
  return `title-${title.replace(/\s+/g, "-")}`;
}

export function normalizeIngredientList(ingredients) {
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

export function normalizeRecipe(recipe) {
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

export function normalizeRecipes(recipes) {
  if (!Array.isArray(recipes)) {
    return [];
  }
  return recipes.map(normalizeRecipe);
}
