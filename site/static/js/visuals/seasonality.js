import { valueAt } from "./math.js";
import { COLORS, STYLE } from "./constants.js";

export function initSeasonality() {
    const cfgs = [
        { id: "dailyCanvas", label: "Daily", color: COLORS.seasonality.daily, points: [0, 0.2, 0.55, 0.85, 1.0].map((x, i) => ({ x, y: [0.15, 0.4, 0.15, 0.55, 0.2][i] })) },
        { id: "weeklyCanvas", label: "Weekly", color: COLORS.seasonality.weekly, points: [0, 0.16, 0.32, 0.5, 0.68, 0.84, 1.0].map((x, i) => ({ x, y: [0.5, 0.62, 0.52, 0.35, 0.6, 0.7, 0.5][i] })) },
        { id: "annualCanvas", label: "Annual", color: COLORS.seasonality.annual, points: [0, 0.25, 0.5, 0.75, 1.0].map((x, i) => ({ x, y: [0.25, 0.35, 0.6, 0.4, 0.25][i] })) }
    ];

    const comboCanvas = document.getElementById("comboCanvas");
    if (!comboCanvas) return;
    const comboCtx = comboCanvas.getContext("2d");

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

    function drawChart(ctx, width, height, points, color) {
        ctx.clearRect(0, 0, width, height);
        const steps = Math.max(100, Math.floor(width / 2));
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = t * width;
            const y = height - valueAt(points, t) * (height - 12) - 6;
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
        ctx.fillStyle = "#222";
        points.forEach(p => {
            const x = p.x * width;
            const y = height - p.y * (height - 12) - 6;
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
        const steps = Math.max(200, Math.floor(w / 2));
        let maxVal = 0;
        const vals = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const daily = valueAt(cfgs[0].points, (t * 365) % 1);
            const weekly = valueAt(cfgs[1].points, (t * 52) % 1);
            const annual = valueAt(cfgs[2].points, t);
            const v = daily + weekly + annual;
            vals.push(v);
            if (v > maxVal) maxVal = v;
        }
        const scale = maxVal || 1;
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
    }

    function resizeAll() {
        // Resize combo canvas
        const comboDims = setupCanvas(comboCanvas, 4);
        comboWidth = comboDims.width;
        comboHeight = comboDims.height;

        // Resize individual canvases (taller aspect ratio since they're narrower)
        cfgs.forEach(cfg => {
            const canvas = document.getElementById(cfg.id);
            if (!canvas) return;
            const dims = setupCanvas(canvas, 2.5);
            canvasData.set(cfg.id, dims);
        });

        renderAll();
    }

    function renderAll() {
        cfgs.forEach(cfg => {
            const canvas = document.getElementById(cfg.id);
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            const dims = canvasData.get(cfg.id);
            if (dims) {
                drawChart(ctx, dims.width, dims.height, cfg.points, cfg.color);
            }
        });
        drawCombo();
    }

    // Setup each individual canvas with drag handling
    cfgs.forEach(cfg => {
        const canvas = document.getElementById(cfg.id);
        if (!canvas) return;
        let dragging = null;

        function pointer(e) {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1 - (e.clientY - rect.top) / rect.height;
            return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
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
            cfg.points[dragging].y = p.y;
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
}
