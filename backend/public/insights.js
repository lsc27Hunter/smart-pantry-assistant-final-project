// Insights logic module
// Handles analytics and insights rendering

import { WEEK_DAYS, toIsoDate, addDays } from "./utils.js";

export function getLast7Days() {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i -= 1) {
    dates.push(addDays(today, -i));
  }
  return dates;
}

export function renderWasteChart(wasteChart, wastedItems) {
  if (!wasteChart) return;
  const ctx = wasteChart.getContext("2d");
  if (!ctx) return;
  const dates = getLast7Days();
  const labels = dates.map((date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );
  const counts = dates.map((date) => {
    const isoDate = toIsoDate(date);
    return wastedItems.filter((item) => {
      if (!item || !item.wastedAt) return false;
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

export function renderInsights({
  insightPantryCount,
  insightWastedCount,
  insightMealPlanCount,
  insightExpiringCount,
  pantryItems,
  wastedItems,
  mealPlan,
  renderWasteChartFn,
  wasteChart,
  isExpiringSoonFn,
}) {
  if (!insightPantryCount) return;
  const pantryCountValue = pantryItems.length;
  const wastedCountValue = wastedItems.length;
  const mealPlanCountValue = WEEK_DAYS.reduce((sum, dayName) => {
    return sum + (mealPlan[dayName] || []).length;
  }, 0);
  const expiringCountValue = pantryItems.filter((item) =>
    isExpiringSoonFn(item.expiryDate)
  ).length;
  insightPantryCount.textContent = String(pantryCountValue);
  insightWastedCount.textContent = String(wastedCountValue);
  insightMealPlanCount.textContent = String(mealPlanCountValue);
  insightExpiringCount.textContent = String(expiringCountValue);
  renderWasteChartFn(wasteChart, wastedItems);
}
