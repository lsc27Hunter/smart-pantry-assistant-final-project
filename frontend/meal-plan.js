// Meal plan logic module
// Handles meal plan CRUD and rendering

import { makeItemId, toIsoDate, addDays, getWeekStartMonday } from "./utils.js";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

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

let mealPlan = normalizeMealPlan(JSON.parse(localStorage.getItem("mealPlan")));
let mealPlanWeekOffset = 0;

export function getMealPlan() {
  return mealPlan;
}

export function setMealPlan(newPlan) {
  mealPlan = newPlan;
  localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
}

export function normalizeMealPlan(rawMealPlan) {
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

export function getMealPlanWeekOffset() {
  return mealPlanWeekOffset;
}

export function setMealPlanWeekOffset(offset) {
  mealPlanWeekOffset = offset;
}

export function addMealToPlan(dayName, meal) {
  if (!mealPlan[dayName]) return;
  mealPlan[dayName].push(meal);
  setMealPlan(mealPlan);
}

export function removeMealPlanEntry(dayName, mealId) {
  if (!mealPlan[dayName]) return;
  mealPlan[dayName] = mealPlan[dayName].filter((entry) => entry.id !== mealId);
  setMealPlan(mealPlan);
}
