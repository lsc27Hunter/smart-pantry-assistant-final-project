const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Smart Pantry & Nutrition Assistant API is running");
});

app.get("/api/recipes", async (req, res) => {
  const { ingredients } = req.query;

  if (!ingredients) {
    return res.status(400).json({ error: "Ingredients are required" });
  }

  try {
    const apiKey = process.env.SPOONACULAR_API_KEY;

    const response = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
        ingredients
      )}&number=12&ranking=1&ignorePantry=true&apiKey=${apiKey}`
    );

    const data = await response.json();

    const cleanedRecipes = data.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      usedIngredientCount: recipe.usedIngredientCount,
      missedIngredientCount: recipe.missedIngredientCount,
      usedIngredients: recipe.usedIngredients.map((item) => item.name),
      missedIngredients: recipe.missedIngredients.map((item) => item.name),
    }));

    res.json(cleanedRecipes);
  } catch (error) {
    console.error("Recipe API error:", error);
    res.status(500).json({ error: "Failed to fetch recipes" });
    console.log("test");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
