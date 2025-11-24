/**
 * US Wealth distribution chart
 * Shows the extreme power-law nature of wealth (Pareto distribution)
 */
export function initWealthDistribution(containerId, logCheckboxId) {
    const container = document.getElementById(containerId);
    const logCheckbox = document.getElementById(logCheckboxId);
    if (!container) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'static-chart-canvas';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Get colors from CSS
    function getColors() {
        const isDark = document.documentElement.classList.contains('darkmode') ||
                       window.matchMedia('(prefers-color-scheme: dark)').matches;
        return {
            axis: isDark ? '#a89984' : '#7c6f64',
            text: isDark ? '#d5c4a1' : '#504945',
            textLight: isDark ? '#bdae93' : '#665c54'
        };
    }

    // Pareto (power-law) distribution parameters
    // Based on US Federal Reserve SCF data
    // Using Pareto Type I: P(X > x) = (x_min/x)^α
    // α ≈ 1.5 for US wealth (very heavy tail)
    const wealthParams = {
        xMin: 10000,    // Minimum wealth threshold ($10k)
        alpha: 1.5,     // Pareto exponent (lower = more inequality)
        color: 'rgba(156, 39, 176, 0.6)',
        stroke: 'rgba(156, 39, 176, 1)'
    };

    // Pareto PDF: f(x) = α * x_min^α / x^(α+1)
    function paretoPDF(x, xMin, alpha) {
        if (x < xMin) return 0;
        return alpha * Math.pow(xMin, alpha) / Math.pow(x, alpha + 1);
    }

    // Complementary CDF (survival function): P(X > x) = (x_min/x)^α
    function paretoCCDF(x, xMin, alpha) {
        if (x < xMin) return 1;
        return Math.pow(xMin / x, alpha);
    }

    let width, height;
    let useLogLog = false;

    function resize() {
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        width = rect.width;
        height = width / 2.5;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
        draw();
    }

    function formatMoney(value) {
        if (value >= 1e12) return `$${(value / 1e12).toFixed(0)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(0)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
        if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}k`;
        return `$${value}`;
    }

    function draw() {
        const colors = getColors();
        const padding = { top: 30, right: 20, bottom: 50, left: 60 };
        const plotW = width - padding.left - padding.right;
        const plotH = height - padding.top - padding.bottom;

        // Clear
        ctx.clearRect(0, 0, width, height);

        if (useLogLog) {
            drawLogLogPlot(colors, padding, plotW, plotH);
        } else {
            drawLinearPlot(colors, padding, plotW, plotH);
        }
    }

    function drawLinearPlot(colors, padding, plotW, plotH) {
        const { xMin, alpha } = wealthParams;

        // Linear scale: $10k to $10M (most of the mass is here)
        const xStart = xMin;
        const xEnd = 10000000;
        const step = 10000;

        // Calculate y max
        const yMax = paretoPDF(xMin, xMin, alpha) * 1.1;

        // Draw axes
        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // X-axis labels
        ctx.fillStyle = colors.text;
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const xTicks = [0, 2e6, 4e6, 6e6, 8e6, 10e6];
        for (const val of xTicks) {
            const px = padding.left + (val / xEnd) * plotW;
            ctx.fillText(formatMoney(val), px, height - padding.bottom + 8);

            ctx.beginPath();
            ctx.moveTo(px, height - padding.bottom);
            ctx.lineTo(px, height - padding.bottom + 4);
            ctx.stroke();
        }

        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText('Net Worth', padding.left + plotW / 2, height - 12);

        // Y-axis title
        ctx.save();
        ctx.translate(15, padding.top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Density', 0, 0);
        ctx.restore();

        // Draw distribution
        ctx.fillStyle = wealthParams.color;
        ctx.strokeStyle = wealthParams.stroke;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(padding.left, height - padding.bottom);

        for (let x = xStart; x <= xEnd; x += step) {
            const y = paretoPDF(x, xMin, alpha);
            const px = padding.left + ((x - 0) / xEnd) * plotW;
            const py = height - padding.bottom - (y / yMax) * plotH;
            ctx.lineTo(px, Math.max(padding.top, py));
        }

        ctx.lineTo(padding.left + plotW, height - padding.bottom);
        ctx.closePath();
        ctx.fill();

        // Stroke
        ctx.beginPath();
        for (let x = xStart; x <= xEnd; x += step) {
            const y = paretoPDF(x, xMin, alpha);
            const px = padding.left + ((x - 0) / xEnd) * plotW;
            const py = height - padding.bottom - (y / yMax) * plotH;
            if (x === xStart) {
                ctx.moveTo(px, Math.max(padding.top, py));
            } else {
                ctx.lineTo(px, Math.max(padding.top, py));
            }
        }
        ctx.stroke();

        // Note about the tail
        ctx.fillStyle = colors.textLight;
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('Long tail extends to $100B+', width - padding.right - 5, padding.top + 5);
    }

    function drawLogLogPlot(colors, padding, plotW, plotH) {
        const { xMin, alpha } = wealthParams;

        // Log-log scale: $10k to $1T
        const logXMin = Math.log10(xMin);
        const logXMax = Math.log10(1e12); // $1T

        // For CCDF, y ranges from 1 (at xMin) to very small
        // At $500B with α=1.5: (10k/500B)^1.5 ≈ 10^-11.5
        // Need to show full range to ~$500B (richest people)
        const logYMin = -10;  // 10^-10 (1 in 10 billion)
        const logYMax = 0;    // 10^0 = 1

        // Draw axes
        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // X-axis labels (log scale)
        ctx.fillStyle = colors.text;
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const xLogTicks = [1e4, 1e6, 1e8, 1e10, 1e12];
        for (const val of xLogTicks) {
            const logVal = Math.log10(val);
            const px = padding.left + ((logVal - logXMin) / (logXMax - logXMin)) * plotW;
            ctx.fillText(formatMoney(val), px, height - padding.bottom + 8);

            ctx.beginPath();
            ctx.moveTo(px, height - padding.bottom);
            ctx.lineTo(px, height - padding.bottom + 4);
            ctx.stroke();
        }

        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText('Net Worth (log scale)', padding.left + plotW / 2, height - 12);

        // Y-axis labels (log scale) - showing CCDF P(X > x)
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = '10px system-ui, sans-serif';

        const yLogTicks = [
            { val: 1, label: '100%' },
            { val: 0.1, label: '10%' },
            { val: 0.01, label: '1%' },
            { val: 1e-4, label: '0.01%' },
            { val: 1e-6, label: '1 in 1M' },
            { val: 1e-8, label: '1 in 100M' },
            { val: 1e-10, label: '1 in 10B' }
        ];
        for (const { val, label } of yLogTicks) {
            const logVal = Math.log10(val);
            const py = height - padding.bottom - ((logVal - logYMin) / (logYMax - logYMin)) * plotH;

            ctx.fillText(label, padding.left - 5, py);

            ctx.beginPath();
            ctx.moveTo(padding.left - 4, py);
            ctx.lineTo(padding.left, py);
            ctx.stroke();
        }

        // Y-axis title
        ctx.save();
        ctx.translate(12, padding.top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText('% with wealth > x', 0, 0);
        ctx.restore();

        // Draw CCDF line (should be straight on log-log for power law)
        ctx.strokeStyle = wealthParams.stroke;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        let first = true;
        for (let logX = logXMin; logX <= logXMax; logX += 0.05) {
            const x = Math.pow(10, logX);
            const ccdf = paretoCCDF(x, xMin, alpha);
            const logY = Math.log10(ccdf);

            // Clamp to plot area but keep drawing
            const clampedLogY = Math.max(logYMin, logY);

            const px = padding.left + ((logX - logXMin) / (logXMax - logXMin)) * plotW;
            const py = height - padding.bottom - ((clampedLogY - logYMin) / (logYMax - logYMin)) * plotH;

            if (first) {
                ctx.moveTo(px, py);
                first = false;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();

        // Label
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('Straight line = Power Law', padding.left + 10, padding.top + 5);

        ctx.font = '11px system-ui, sans-serif';
        ctx.fillStyle = colors.textLight;
        ctx.fillText(`Pareto exponent α = ${alpha}`, padding.left + 10, padding.top + 20);
    }

    // Checkbox handler
    if (logCheckbox) {
        logCheckbox.addEventListener('change', () => {
            useLogLog = logCheckbox.checked;
            draw();
        });
    }

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resize, 100);
    });

    resize();
}
