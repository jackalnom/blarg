// Pref attachment visualization (line + falling blocks)
function makePositions(width, bins, logX) {
  const arr = [];
  for (let i = 0; i <= bins; i++) {
    const t = i / bins;
    const u = logX ? Math.log1p(i) / Math.log1p(bins) : t;
    arr.push(u * width);
  }
  return arr;
}

function drawLine(ctx, stacks, positions, blockPx, height, color, logY) {
  const maxStack = Math.max(...stacks, 1);
  ctx.beginPath();
  for (let i = 0; i < stacks.length; i++) {
    const x = (positions[i] + positions[i + 1]) / 2;
    const hLinear = stacks[i] * blockPx;
    const h = logY ? (Math.log1p(stacks[i]) / Math.log1p(maxStack)) * height : hLinear;
    const y = height - h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function initPrefAttach({ canvasId, buttonId, logXId, logYId }) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const btn = document.getElementById(buttonId);
  const logXToggle = document.getElementById(logXId);
  const logYToggle = document.getElementById(logYId);

  const blockPx = 5;
  const stepsPerFrame = 1500;
  const maxSteps = 120_000;
  const blockValue = 4;
  const baseHue = 338;
  const pNew = 0.02;
  const smooth = 0.18;

  const width = canvas.width;
  const height = canvas.height;

  function ensureSize(n) {
    const need = Math.max(0, n - counts.length);
    if (need > 0) {
      counts.push(...Array(need).fill(0));
      stacks.push(...Array(need).fill(0));
    }
  }

  let running = false;
  let stopSpawning = false;
  let steps = 0;
  let totalMass = 1;
  let maxSize = 1;
  const counts = new Array(70).fill(0);
  const stacks = new Array(70).fill(0);
  const sizes = [1];
  const sizeCounts = { 1: 1 };

  function weightedPick() {
    const r = Math.random() * totalMass;
    let acc = 0;
    for (let i = 0; i < sizes.length; i++) {
      acc += sizes[i];
      if (acc >= r) return i;
    }
    return sizes.length - 1;
  }

  function refreshBins() {
    ensureSize(maxSize);
    counts.fill(0);
    for (const [sizeStr, count] of Object.entries(sizeCounts)) {
      const size = Number(sizeStr);
      const idx = Math.max(0, size - 1);
      ensureSize(idx + 1);
      counts[idx] += count;
    }
  }

  function step() {
    for (let i = 0; i < stepsPerFrame; i++) {
      if (stopSpawning) break;
      if (Math.random() < pNew) {
        sizes.push(1);
        sizeCounts[1] = (sizeCounts[1] || 0) + 1;
        totalMass += 1;
      } else {
        const idx = weightedPick();
        const oldSize = sizes[idx];
        const newSize = oldSize + 1;
        sizes[idx] = newSize;
        sizeCounts[oldSize]--;
        if (sizeCounts[oldSize] === 0) delete sizeCounts[oldSize];
        sizeCounts[newSize] = (sizeCounts[newSize] || 0) + 1;
        totalMass += 1;
        if (newSize > maxSize) maxSize = newSize;
      }
      steps++;
      if (steps >= maxSteps) stopSpawning = true;
    }
    refreshBins();

    for (let i = 0; i < counts.length; i++) {
      const targetBlocks = counts[i] / blockValue;
      stacks[i] = stacks[i] + (targetBlocks - stacks[i]) * smooth;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const activeBins = counts.length;
    const positions = makePositions(width, activeBins, logXToggle.checked);
    drawLine(ctx, stacks, positions, blockPx, height, `hsl(${baseHue}, 65%, 45%)`, logYToggle.checked);

    ctx.fillStyle = "#222";
    ctx.font = "16px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.fillText(
      `Steps: ${steps.toLocaleString()} · Agents: ${sizes.length.toLocaleString()} · Max size: ${maxSize}`,
      12,
      24
    );
  }

  function loop() {
    if (!running) return;
    step();
    draw();
    if (stopSpawning) {
      running = false;
      btn.disabled = false;
      btn.textContent = "📊 Preferential Attachment";
      return;
    }
    requestAnimationFrame(loop);
  }

  btn?.addEventListener("click", () => {
    if (running) return;
    running = true;
    stopSpawning = false;
    steps = 0;
    totalMass = 1;
    maxSize = 1;
    sizes.length = 1;
    sizes[0] = 1;
    for (const k of Object.keys(sizeCounts)) delete sizeCounts[k];
    sizeCounts[1] = 1;
    counts.length = 70;
    stacks.length = 70;
    counts.fill(0);
    stacks.fill(0);
    btn.disabled = true;
    btn.textContent = "Building…";
    draw();
    requestAnimationFrame(loop);
  });

  draw();
}
