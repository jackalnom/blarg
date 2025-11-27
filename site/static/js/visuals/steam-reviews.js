import { getThemeColors, listenForThemeChange } from "./utils.js";

/**
 * Steam game review counts histogram (power-law shape)
 * Data source: static/data/steam_reviews_binned.csv
 */
export async function initSteamReviews(containerId, logCheckboxId) {
  const container = document.getElementById(containerId);
  const logCheckbox = document.getElementById(logCheckboxId);
  if (!container) return;

  const canvas = document.createElement("canvas");
  canvas.className = "static-chart-canvas";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  async function loadData() {
    const res = await fetch("/data/steam_reviews_binned.csv");
    const text = await res.text();
    return text
      .trim()
      .split("\n")
      .slice(1)
      .map((line) => {
        const [reviews, games] = line.split(",");
        return { reviews: Number(reviews), games: Number(games) };
      })
      .filter((d) => d.games > 0 && d.reviews > 0);
  }

  let data = await loadData();
  let width = 0,
    height = 0;

  function resize() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = Math.max(260, Math.min(480, rect.width * 0.5));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
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
    const xMin = Math.min(...data.map((d) => d.reviews));
    const xMax = Math.max(...data.map((d) => d.reviews));
    const yMax = Math.max(...data.map((d) => d.games));

    function xScale(v) {
      if (useLog) {
        const lv = Math.log10(v);
        const lmin = Math.log10(xMin);
        const lmax = Math.log10(xMax);
        return padding.left + ((lv - lmin) / (lmax - lmin)) * plotW;
      }
      return padding.left + ((v - xMin) / (xMax - xMin)) * plotW;
    }
    function yScale(v) {
      if (useLog) {
        const lv = Math.log10(v);
        const lmax = Math.log10(yMax);
        return padding.top + (1 - lv / lmax) * plotH;
      }
      return padding.top + (1 - v / yMax) * plotH;
    }

    function formatTick(v) {
      if (v >= 1e6) return `${Math.round(v / 1e5) / 10}M`;
      if (v >= 1e3) return `${Math.round(v / 1e2) / 10}k`;
      return v.toString();
    }

    function linearTicks(min, max, desired = 5) {
      const span = max - min;
      if (span <= 0) return [min];
      const rawStep = span / desired;
      const step = Math.pow(10, Math.floor(Math.log10(rawStep)));
      const niceStep = rawStep / step >= 5 ? 5 * step : rawStep / step >= 2 ? 2 * step : step;
      const start = Math.ceil(min / niceStep) * niceStep;
      const ticks = [];
      for (let t = start; t <= max; t += niceStep) ticks.push(t);
      if (ticks.length === 0) ticks.push(max);
      return ticks;
    }

    // axes
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // grid + ticks x
    ctx.fillStyle = c.fg;
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const xTicks = useLog
      ? [1, 10, 100, 1000, 10000].filter((t) => t >= xMin && t <= xMax)
      : linearTicks(xMin, xMax);
    xTicks.forEach((t) => {
      const px = xScale(t);
      ctx.strokeStyle = c.grid;
      ctx.beginPath();
      ctx.moveTo(px, padding.top);
      ctx.lineTo(px, height - padding.bottom);
      ctx.stroke();
      ctx.strokeStyle = c.grid;
      ctx.beginPath();
      ctx.moveTo(px, height - padding.bottom);
      ctx.lineTo(px, height - padding.bottom + 4);
      ctx.stroke();
      ctx.fillText(useLog ? `1e${Math.round(Math.log10(t))}` : formatTick(t), px, height - padding.bottom + 6);
    });
    ctx.fillStyle = c.fg;
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("Number of reviews", padding.left + plotW / 2, height - 12);

    // y ticks
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const yTicks = useLog ? [1, 10, 100, 1000, 10000].filter((t) => t > 0 && t <= yMax) : linearTicks(0, yMax);
    yTicks.forEach((t) => {
      const py = yScale(t);
      ctx.strokeStyle = c.grid;
      ctx.beginPath();
      ctx.moveTo(padding.left, py);
      ctx.lineTo(width - padding.right, py);
      ctx.stroke();
      ctx.strokeStyle = c.grid;
      ctx.beginPath();
      ctx.moveTo(padding.left - 4, py);
      ctx.lineTo(padding.left, py);
      ctx.stroke();
      ctx.fillStyle = c.fg;
      ctx.font = "11px system-ui, sans-serif";
      ctx.fillText(useLog ? `1e${Math.round(Math.log10(t))}` : formatTick(t), padding.left - 8, py);
    });
    ctx.save();
    ctx.translate(18, padding.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillStyle = c.fg;
    ctx.fillText("Number of games", 0, 0);
    ctx.restore();

    // bars
    ctx.fillStyle = c.point; // Use transparent blue
    const barPad = 2;
    data.forEach((d) => {
      const x = xScale(d.reviews);
      const barW = useLog ? (plotW / data.length) * 0.8 : Math.max(2, plotW / data.length);
      const y = yScale(d.games);
      ctx.fillRect(x - barW / 2, y, barW, height - padding.bottom - y);
    });

    // outline (as a loose line)
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = xScale(d.reviews);
      const y = yScale(d.games);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = c.node; // Use solid blue
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  resize();

  listenForThemeChange(() => {
    draw();
  });

  logCheckbox?.addEventListener("change", draw);
  window.addEventListener("resize", resize);
}
