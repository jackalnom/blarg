import { valueAt, catmull } from "./math.js";
import { COLORS, STYLE } from "./constants.js";
import { getThemeColors, listenForThemeChange } from "./utils.js";

// Periodic Catmull-Rom sampling that wraps cleanly around [0, 1]
function valueAtPeriodic(points, t) {
    if (!points.length) return 0;

    // Normalize t to [0, 1)
    let tWrapped = t % 1;
    if (tWrapped < 0) tWrapped += 1;

    const sorted = points; // Points are assumed sorted from init
    const n = sorted.length;

    // Find the segment where p1.x <= tWrapped < p2.x
    // We handle wrapping by creating virtual points
    let i = 0;
    while (i < n && sorted[i].x <= tWrapped) i++;

    // i is the index of the first point > tWrapped
    // The segment is between index i-1 (p1) and i (p2)

    let p0, p1, p2, p3;

    if (i === 0) {
        // tWrapped is before the first point. Segment is [last-1, first]
        p1 = { x: sorted[n - 1].x - 1, y: sorted[n - 1].y };
        p2 = sorted[0];
        p0 = { x: sorted[n - 2].x - 1, y: sorted[n - 2].y };
        p3 = sorted[1];
    } else if (i === n) {
        // tWrapped is after the last point. Segment is [last, first+1]
        p1 = sorted[n - 1];
        p2 = { x: sorted[0].x + 1, y: sorted[0].y };
        p0 = sorted[n - 2];
        p3 = { x: sorted[1].x + 1, y: sorted[1].y };
    } else {
        // Internal segment
        p1 = sorted[i - 1];
        p2 = sorted[i];

        // p0
        if (i - 1 === 0) p0 = { x: sorted[n - 1].x - 1, y: sorted[n - 1].y };
        else p0 = sorted[i - 2];

        // p3
        if (i === n - 1) p3 = { x: sorted[0].x + 1, y: sorted[0].y };
        else p3 = sorted[i + 1];
    }

    const span = p2.x - p1.x;
    if (span < 1e-6) return p1.y;
    const localT = (tWrapped - p1.x) / span;

    const y = catmull(p0.y, p1.y, p2.y, p3.y, localT);
    return Math.max(0, Math.min(1, y));
}

// Linear extrapolation for Trend
function valueAtLinear(points, t) {
    if (points.length < 2) return points[0]?.y || 0;

    // Use first and last point to define the line
    const pStart = points[0];
    const pEnd = points[points.length - 1];

    if (Math.abs(pEnd.x - pStart.x) < 1e-6) return pStart.y;

    const slope = (pEnd.y - pStart.y) / (pEnd.x - pStart.x);
    const intercept = pStart.y - slope * pStart.x;

    return slope * t + intercept;
}

function makeEquidistantPoints(values, inset = 0.06) {
    if (!values.length) return [];
    if (values.length === 1) return [{ x: 0.5, y: values[0] }];
    const span = Math.max(0.0001, 1 - inset * 2);
    const step = span / (values.length - 1);
    return values.map((y, i) => ({ x: inset + step * i, y }));
}

export function initSeasonality() {
    const controlCfgs = [
        {
            id: "weeklyCanvas",
            label: "Weekly",
            color: COLORS.seasonality.weekly,
            periodic: true,
            points: makeEquidistantPoints([0.5, 0.62, 0.52, 0.35, 0.6, 0.7, 0.5], 0.08),
            yClamp: [0, 1],
            yDomain: [0, 1]
        },
        {
            id: "annualCanvas",
            label: "Annual",
            color: COLORS.seasonality.annual,
            periodic: true,
            points: makeEquidistantPoints([0.25, 0.35, 0.6, 0.4, 0.25], 0.08),
            yClamp: [0, 1],
            yDomain: [0, 1]
        },
        {
            id: "trendCanvas",
            label: "Trend",
            color: COLORS.seasonality.trend,
            periodic: false,
            points: makeEquidistantPoints([0.9, 1.1], 0.08),
            yClamp: [0.4, 1.6],
            yDomain: [0.4, 1.6]
        }
    ];

    const comboCanvas = document.getElementById("comboCanvas");
    if (!comboCanvas) return;
    const comboCtx = comboCanvas.getContext("2d");

    // Noise control
    const noiseSlider = document.getElementById("seasonalityNoise");
    let noiseLevel = noiseSlider ? parseFloat(noiseSlider.value) : 0;

    if (noiseSlider) {
        noiseSlider.addEventListener("input", () => {
            noiseLevel = parseFloat(noiseSlider.value);
            renderAll();
        });
    }

    // Track logical dimensions
    let comboWidth = 0;
    let comboHeight = 0;
    const canvasData = new Map(); // Store width/height per canvas

    function setupCanvas(canvas, aspectRatio = 2.5) {
        const container = canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = container.clientWidth;
        const displayHeight = Math.round(displayWidth / aspectRatio);

        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
        canvas.width = Math.floor(displayWidth * dpr);
        canvas.height = Math.floor(displayHeight * dpr);

        const ctx = canvas.getContext("2d");
        ctx.resetTransform();
        ctx.scale(dpr, dpr);

        return { width: displayWidth, height: displayHeight };
    }

    function drawChart(ctx, width, height, points, color, periodic = true, yDomain = [0, 1]) {
        ctx.clearRect(0, 0, width, height);
        const steps = Math.max(100, Math.floor(width / 2));
        const [yMin, yMax] = yDomain;
        const ySpan = Math.max(1e-6, yMax - yMin);
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = t * width;
            const sampler = periodic ? valueAtPeriodic : valueAtLinear;
            const v = sampler(points, t);
            const norm = Math.max(0, Math.min(1, (v - yMin) / ySpan));
            const y = height - norm * (height - 12) - 6;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsl(${color}, 70%, 45%)`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = `hsla(${color}, 70%, 60%, 0.12)`;
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        // Draw draggable points
        const colors = getThemeColors();
        ctx.fillStyle = colors.fg; // Dark/Light text color for points? No, points are usually dark/light contrast
        // Actually, points are #222 (dark) in original.
        // Let's make them theme aware: dark on light bg, light on dark bg
        ctx.fillStyle = colors.fg;
        points.forEach(p => {
            const x = p.x * width;
            const norm = Math.max(0, Math.min(1, (p.y - yMin) / ySpan));
            const y = height - norm * (height - 12) - 6;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });
    }

    function drawCombo() {
        const w = comboWidth;
        const h = comboHeight;
        if (w === 0 || h === 0) return;

        comboCtx.clearRect(0, 0, w, h);
        // Use a high sample count to avoid aliasing the high-frequency weekly component
        const steps = Math.max(1200, Math.floor(w * 4));
        let maxVal = 0;
        const vals = [];

        // Light vertical guides for year boundaries (3-year span)
        const colors = getThemeColors();
        const guideColor = colors.grid; // Use grid color
        comboCtx.strokeStyle = guideColor;
        comboCtx.lineWidth = 1;
        for (let yr = 0; yr <= 3; yr++) {
            const x = (yr / 3) * w;
            comboCtx.beginPath();
            comboCtx.moveTo(x, 0);
            comboCtx.lineTo(x, h);
            comboCtx.stroke();
        }

        const weeklyCfg = controlCfgs.find(c => c.id === "weeklyCanvas");
        const annualCfg = controlCfgs.find(c => c.id === "annualCanvas");
        const trendCfg = controlCfgs.find(c => c.id === "trendCanvas");
        const weeklyPoints = weeklyCfg?.points ?? [];
        const annualPoints = annualCfg?.points ?? [];
        const trendPoints = trendCfg?.points ?? [{ x: 0, y: 1 }, { x: 1, y: 1 }];

        // Calculate trend slope and intercept for extrapolation
        const trendSlope = (trendPoints[1].y - trendPoints[0].y) / (trendPoints[1].x - trendPoints[0].x);
        const trendIntercept = trendPoints[0].y - trendSlope * trendPoints[0].x;

        // Span 3 years instead of 1
        for (let i = 0; i <= steps; i++) {
            const t = i / steps; // 0 to 1 over 3 years

            // Linear trend extrapolated to full 0-1 range (multiplicative factor)
            const trend = trendSlope * t + trendIntercept;

            // Seasonality components (repeating over 3 years)
            // Weekly: Remap from [0,1] to [0.8, 1.2] (dampened effect)
            const weeklyRaw = valueAtPeriodic(weeklyPoints, t * 3 * 52);
            const weekly = 0.8 + weeklyRaw * 0.4;

            const annualRaw = valueAtPeriodic(annualPoints, t * 3);
            const annual = 0.5 + annualRaw;

            // Multiplicative composition
            let v = Math.max(0, trend * weekly * annual);

            // Add noise
            if (noiseLevel > 0) {
                v += (Math.random() - 0.5) * noiseLevel;
                v = Math.max(0, v);
            }
            vals.push(v);
            if (v > maxVal) maxVal = v;
        }
        const scale = maxVal || 1;

        // Draw combined line
        comboCtx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * w;
            const y = h - (vals[i] / scale) * (h - 24) - 6;
            if (i === 0) comboCtx.moveTo(x, y); else comboCtx.lineTo(x, y);
        }
        comboCtx.strokeStyle = `hsl(${COLORS.seasonality.combined}, 75%, 58%)`;
        comboCtx.lineWidth = 2;
        comboCtx.stroke();
        comboCtx.fillStyle = `hsla(${COLORS.seasonality.combined}, 75%, 65%, 0.12)`;
        comboCtx.lineTo(w, h);
        comboCtx.lineTo(0, h);
        comboCtx.closePath();
        comboCtx.fill();

        // Year labels along bottom (Year 1/2/3)
        comboCtx.fillStyle = colors.fg;
        comboCtx.font = "11px system-ui, sans-serif";
        comboCtx.textAlign = "center";
        comboCtx.textBaseline = "bottom";
        for (let yr = 0; yr < 3; yr++) {
            const x = ((yr + 0.5) / 3) * w;
            comboCtx.fillText(`Year ${yr + 1}`, x, h - 4);
        }

        // Draw trend line - extrapolate to edges even though control points are inset
        comboCtx.strokeStyle = colors.fg;
        comboCtx.lineWidth = 2;
        comboCtx.setLineDash([5, 5]);
        comboCtx.beginPath();

        // Calculate slope
        const slope = (trendPoints[1].y - trendPoints[0].y) / (trendPoints[1].x - trendPoints[0].x);
        const intercept = trendPoints[0].y - slope * trendPoints[0].x;

        // Extrapolate to x=0 and x=1
        const yAt0 = intercept;
        const yAt1 = slope + intercept;

        const y0 = h - (yAt0 / scale) * (h - 24) - 6;
        const y1 = h - (yAt1 / scale) * (h - 24) - 6;
        comboCtx.moveTo(0, y0);
        comboCtx.lineTo(w, y1);
        comboCtx.stroke();
        comboCtx.setLineDash([]);
    }

    function resizeAll() {
        // Resize combo canvas
        const comboDims = setupCanvas(comboCanvas, 4);
        comboWidth = comboDims.width;
        comboHeight = comboDims.height;

        // Resize individual canvases (taller aspect ratio since they're narrower)
        controlCfgs.forEach(cfg => {
            const canvas = document.getElementById(cfg.id);
            if (!canvas) return;
            const dims = setupCanvas(canvas, 2.5);
            canvasData.set(cfg.id, dims);
        });

        renderAll();
    }

    function renderAll() {
        controlCfgs.forEach(cfg => {
            const canvas = document.getElementById(cfg.id);
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            const dims = canvasData.get(cfg.id);
            if (dims) {
                drawChart(ctx, dims.width, dims.height, cfg.points, cfg.color, cfg.periodic, cfg.yDomain || [0, 1]);
            }
        });
        drawCombo();
    }

    // Setup each individual canvas with drag handling
    controlCfgs.forEach(cfg => {
        const canvas = document.getElementById(cfg.id);
        if (!canvas) return;
        let dragging = null;

        function pointer(e) {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const relY = 1 - (e.clientY - rect.top) / rect.height; // 0..1 screen space
            const clampedX = Math.max(0, Math.min(1, x));
            const clampedRelY = Math.max(0, Math.min(1, relY));
            const domain = cfg.yDomain || [0, 1];
            const y = domain[0] + clampedRelY * (domain[1] - domain[0]);
            return { x: clampedX, y };
        }

        canvas.addEventListener("pointerdown", e => {
            const p = pointer(e);
            let minD = Infinity;
            cfg.points.forEach((pt, idx) => {
                const dx = p.x - pt.x;
                const dy = p.y - pt.y;
                const d = Math.hypot(dx, dy);
                if (d < minD && d < 0.1) {
                    minD = d;
                    dragging = idx;
                }
            });
            if (dragging !== null) {
                e.preventDefault();
                canvas.setPointerCapture(e.pointerId);
            }
        });

        canvas.addEventListener("pointermove", e => {
            if (dragging === null) return;
            const p = pointer(e);
            const clamp = cfg.yClamp || [0, 1];
            cfg.points[dragging].y = Math.max(clamp[0], Math.min(clamp[1], p.y));
            renderAll();
        });

        canvas.addEventListener("pointerup", () => dragging = null);
        canvas.addEventListener("pointercancel", () => dragging = null);
    });

    // Handle resize
    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeAll, 100);
    });

    // Initial setup
    resizeAll();

    listenForThemeChange(() => {
        renderAll();
    });
}
