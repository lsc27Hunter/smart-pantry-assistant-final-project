// Utility functions for all modules

export function makeItemId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function formatExpiryDate(isoDate) {
  if (!isoDate) {
    return "No expiry set";
  }
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "No expiry set";
  }
  return date.toLocaleDateString();
}

export function toIsoDate(date) {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function isExpiringSoon(isoDate, daysThreshold = 3) {
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

export function normalizePantryItems(rawItems) {
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
