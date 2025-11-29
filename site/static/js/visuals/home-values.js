
import { getThemeColors, listenForThemeChange } from "./utils.js";
import { AxisRenderer, linearTicks } from "./axis-renderer.js";

/**
 * England & Wales House Prices - Real transaction data
 * Shows right-skewed distribution of actual property sales
 * Source: HM Land Registry Price Paid Data, 2024
 * https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
 */
export async function initHomeValues(containerId, logCheckboxId) {
  const container = document.getElementById(containerId);
  const logCheckbox = document.getElementById(logCheckboxId);
  if (!container) return;

  const canvas = document.createElement("canvas");
  canvas.className = "static-chart-canvas";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  async function loadData() {
    const res = await fetch("/data/uk_house_prices.json");
    const json = await res.json();
    // Convert bins to point data (using midpoint of each bracket)
    return json.bins
      .map((b) => ({
        price: (b.min + b.max) / 2,
        count: b.count
      }))
      .filter((d) => d.count > 0 && d.price > 0);
  }

  let data = await loadData();
  let width = 0,
    height = 0;

  function resize() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = Math.max(260, Math.min(480, rect.width * 0.5));
    canvas.style.width = `${width} px`;
    canvas.style.height = `${height} px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    draw();
  }

  function draw() {
    const c = getThemeColors();
    const padding = { top: 30, right: 24, bottom: 50, left: 70 };
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;
    ctx.clearRect(0, 0, width, height);

    const useLog = logCheckbox?.checked;
    const xMin = Math.min(...data.map((d) => d.price));
    const xMax = Math.max(...data.map((d) => d.price));
    const yMax = Math.max(...data.map((d) => d.count));

    // Calculate bin width to ensure bars fit within the plot
    let xDomainMin = xMin;
    let xDomainMax = xMax;

    if (!useLog && data.length > 1) {
      const prices = data.map(d => d.price).sort((a, b) => a - b);
      let minDiff = Infinity;
      for (let i = 1; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff < minDiff) minDiff = diff;
      }
      xDomainMin = xMin - minDiff / 2;
      xDomainMax = xMax + minDiff / 2;
    }

    function xScale(v) {
      if (useLog) {
        const lv = Math.log10(v);
        const lmin = Math.log10(xMin);
        const lmax = Math.log10(xMax);
        return padding.left + ((lv - lmin) / (lmax - lmin)) * plotW;
      }
      return padding.left + ((v - xDomainMin) / (xDomainMax - xDomainMin)) * plotW;
    }
    function yScale(v) {
      // Y-axis is always linear
      return padding.top + (1 - v / yMax) * plotH;
    }

    function formatMoney(v) {
      if (v >= 1e6) return `£${Math.round(v / 1e5) / 10} M`;
      if (v >= 1e3) return `£${Math.round(v / 1e2) / 10} k`;
      return `£${v} `;
    }

    // Use AxisRenderer
    const axisRenderer = new AxisRenderer(ctx, {
      padding,
      xLabel: "Home Value",
      yLabel: "Properties sold",
      grid: true,
      colors: c
    });

    const xTicks = useLog
      ? [10000, 100000, 1000000, 10000000, 100000000].filter((t) => t >= xMin && t <= xMax)
      : linearTicks(xDomainMin, xDomainMax);

    const yTicks = linearTicks(0, yMax);

    axisRenderer.draw({
      width,
      height,
      xScale,
      yScale,
      xTicks,
      yTicks,
      xFormat: (v) => useLog ? `£1e${Math.round(Math.log10(v))}` : formatMoney(v),
      yFormat: formatMoney
    });

    // bars
    ctx.fillStyle = c.point; // Use transparent color
    const baseline = height - padding.bottom;
    data.forEach((d) => {
      const x = xScale(d.price);
      const barW = useLog ? (plotW / data.length) * 0.8 : Math.max(2, plotW / data.length);
      const y = yScale(d.count);
      const barHeight = Math.max(0, baseline - y); // Ensure non-negative height
      ctx.fillRect(x - barW / 2, y, barW, barHeight);
    });

    // outline (as a loose line)
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = xScale(d.price);
      const y = Math.min(yScale(d.count), baseline); // Clamp to not go below baseline
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = c.node; // Use solid color
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  resize();

  listenForThemeChange(() => {
    draw();
  });

  logCheckbox?.addEventListener("change", draw);
  window.addEventListener("resize", resize);
}
