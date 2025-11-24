/**
 * Diminishing Returns / Marginal Utility Visualization
 * Shows non-linear relationship due to logarithmic utility
 */

export function initDiminishingReturns(config) {
    const canvas = document.getElementById(config.canvasId);
    const stepBtn = document.getElementById(config.stepId);
    const runBtn = document.getElementById(config.runId);
    const resetBtn = document.getElementById(config.resetId);
    const exponentSlider = document.getElementById(config.exponentId);
    const exponentValue = document.getElementById(config.exponentValueId);

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    let data = [];
    let exponent = 0.5; // Default is sqrt (x^0.5)
    let running = false;
    let animationId = null;

    function reset() {
        data = [];
        running = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        runBtn.textContent = 'Run';
        draw();
    }

    function step() {
        // Add 3 new random data points
        for (let i = 0; i < 3; i++) {
            const x = Math.random() * 100;
            const trueMean = 100 * Math.pow(x / 100, exponent);
            const noise = (Math.random() - 0.5) * 15;
            const y = Math.max(0, Math.min(100, trueMean + noise));
            data.push({ x, y });
        }

        // Keep last 150 points
        if (data.length > 150) {
            data = data.slice(-150);
        }

        draw();
    }

    function getColors() {
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return {
            bg: isDark ? '#1d2021' : '#fbf1c7',
            fg: isDark ? '#ebdbb2' : '#3c3836',
            fg2: isDark ? '#a89984' : '#7c6f64',
            point: isDark ? '#458588' : '#076678',
            curve: isDark ? '#d79921' : '#d65d0e',
            linear: isDark ? '#cc241d' : '#9d0006'
        };
    }

    function setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const container = canvas.parentElement;
        const displayWidth = container.clientWidth;
        const displayHeight = Math.round(displayWidth / 2.5);

        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        return { width: displayWidth, height: displayHeight };
    }

    function draw() {
        const dims = setupCanvas();
        width = dims.width;
        height = dims.height;

        const colors = getColors();
        const padding = { top: 40, right: 20, bottom: 50, left: 60 };
        const plotW = width - padding.left - padding.right;
        const plotH = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, width, height);

        if (data.length === 0) {
            ctx.fillStyle = colors.fg2;
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Press Step or Run to generate data', width / 2, height / 2);
            return;
        }

        // Scales
        const maxX = 100;
        const maxY = 100;

        const scaleX = (x) => padding.left + (x / maxX) * plotW;
        const scaleY = (y) => height - padding.bottom - (y / maxY) * plotH;

        // Draw axes
        ctx.strokeStyle = colors.fg2;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // X-axis labels
        ctx.fillStyle = colors.fg;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let i = 0; i <= 5; i++) {
            const val = (maxX / 5) * i;
            const x = scaleX(val);
            ctx.fillText(val, x, height - padding.bottom + 5);
        }

        // Y-axis labels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= 5; i++) {
            const val = (maxY / 5) * i;
            const y = scaleY(val);
            ctx.fillText(val, padding.left - 5, y);
        }

        // Axis titles
        ctx.fillStyle = colors.fg;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Input (e.g., Study Hours, Ad Spend)', width / 2, height - 20);

        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Output (e.g., Test Score, Sales)', 0, 0);
        ctx.restore();

        // Draw true curve
        ctx.strokeStyle = colors.curve;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x <= maxX; x += 0.5) {
            const y = 100 * Math.pow(x / 100, exponent);
            const px = scaleX(x);
            const py = scaleY(y);
            if (x === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Draw naive linear expectation
        ctx.strokeStyle = colors.linear;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(scaleX(0), scaleY(0));
        ctx.lineTo(scaleX(100), scaleY(100));
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw data points
        ctx.fillStyle = colors.point;
        for (const d of data) {
            const px = scaleX(d.x);
            const py = scaleY(d.y);
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Legend
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        const legendX = padding.left + 10;
        const legendY = padding.top + 10;

        ctx.strokeStyle = colors.curve;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(legendX, legendY);
        ctx.lineTo(legendX + 30, legendY);
        ctx.stroke();
        ctx.fillStyle = colors.fg;
        ctx.fillText('Actual (diminishing returns)', legendX + 35, legendY + 4);

        ctx.strokeStyle = colors.linear;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(legendX, legendY + 20);
        ctx.lineTo(legendX + 30, legendY + 20);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = colors.fg;
        ctx.fillText('Naive linear expectation', legendX + 35, legendY + 24);
    }

    function runLoop() {
        if (!running) return;
        step();
        setTimeout(() => {
            animationId = requestAnimationFrame(runLoop);
        }, 200);
    }

    // Event listeners
    stepBtn.addEventListener('click', step);

    runBtn.addEventListener('click', () => {
        running = !running;
        if (running) {
            runBtn.textContent = 'Stop';
            runLoop();
        } else {
            runBtn.textContent = 'Run';
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
    });

    resetBtn.addEventListener('click', reset);

    if (exponentSlider) {
        exponentSlider.addEventListener('input', () => {
            exponent = parseFloat(exponentSlider.value);
            if (exponentValue) exponentValue.textContent = exponent.toFixed(2);
            draw();
        });
    }

    window.addEventListener('resize', draw);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw);

    // Initialize
    reset();
}
