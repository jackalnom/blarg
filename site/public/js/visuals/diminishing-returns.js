/**
 * Diminishing Returns / Marginal Utility Visualization
 * Shows non-linear relationship due to logarithmic utility
 */

import { getThemeColors, listenForThemeChange } from "./utils.js";

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
    let exponent = 0.7; // Default (Medium strength: slider at 0.5 maps to 1.2 - 0.5 = 0.7)
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

            // Model diminishing returns: each successive unit of input yields less output
            // Early units: high marginal return (near linear)
            // Later units: low marginal return (far below linear)
            let totalOutput = 0;

            // Integrate marginal returns
            // Marginal return at input level t is proportional to 1/t^(1-exponent)
            // Higher exponent (weak diminishing) → marginal return stays high
            // Lower exponent (strong diminishing) → marginal return drops fast
            const steps = 100;
            const dx = x / steps;

            for (let i = 0; i < steps; i++) {
                const t = (i + 0.5) * dx; // Midpoint of interval
                // Marginal utility at this point (starts at 1, decreases)
                const marginalReturn = Math.pow(Math.max(1 - t / 100, 0.01), (1 - exponent) * 3);
                totalOutput += marginalReturn * dx;
            }

            let y = totalOutput;

            // Add agent-level variation (some agents are more/less efficient)
            const agentEfficiency = 0.92 + Math.random() * 0.16; // 0.92 to 1.08
            y = y * agentEfficiency;

            // Add measurement noise
            const noise = (Math.random() - 0.5) * 4;
            y = Math.max(0, Math.min(100, y + noise));

            data.push({ x, y });
        }

        // Stop if we have enough points
        if (data.length >= 200) {
            running = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            runBtn.textContent = 'Run';
        }

        draw();
    }

    // getColors removed, using getThemeColors from utils.js

    function setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const container = canvas.parentElement;
        const displayWidth = container.clientWidth;
        const displayHeight = Math.round(displayWidth / 1.67); // 50% taller than before (was 2.5)

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

        const colors = getThemeColors();
        // Map theme colors to local needs
        colors.point = colors.node || '#076678';
        colors.curve = colors.threshold || '#d65d0e';
        colors.linear = colors.trendLine || '#9d0006';
        const padding = { top: 40, right: 20, bottom: 50, left: 60 };
        const plotW = width - padding.left - padding.right;
        const plotH = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, width, height);

        if (data.length === 0) {
            ctx.fillStyle = colors.fg;
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
        ctx.strokeStyle = colors.fg;
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
        ctx.fillText('Input (e.g., Study Hours, Ad Spend)', width / 2, height - padding.bottom / 2 + 3);

        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Output (e.g., Test Score, Sales)', 0, 0);
        ctx.restore();

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

        ctx.strokeStyle = colors.linear;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(legendX, legendY);
        ctx.lineTo(legendX + 30, legendY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = colors.fg;
        ctx.fillText('Naive linear expectation', legendX + 35, legendY + 4);
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
            if (data.length >= 200) data = []; // Auto-reset if full
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
            // Invert slider: right (max=1.0) = stronger = lower exponent (0.2)
            const sliderVal = parseFloat(exponentSlider.value);
            exponent = 1.2 - sliderVal; // Maps 0.2->1.0, 1.0->0.2

            // Update label to be descriptive
            if (exponentValue) {
                if (exponent >= 0.8) exponentValue.textContent = 'Weak';
                else if (exponent >= 0.5) exponentValue.textContent = 'Medium';
                else if (exponent >= 0.3) exponentValue.textContent = 'Strong';
                else exponentValue.textContent = 'Very Strong';
            }

            // Reset the plot when strength changes
            reset();
        });
    }

    window.addEventListener('resize', draw);

    listenForThemeChange(() => {
        draw();
    });

    // Initialize - defer to ensure theme is loaded
    setTimeout(() => {
        reset();
    }, 0);
}
