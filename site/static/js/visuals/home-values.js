/**
 * Milwaukee Home Sale Prices - Real transaction data
 * Shows right-skewed distribution of actual home sales
 * Source: City of Milwaukee Open Data Portal, 2024 Property Sales
 */
export async function initHomeValues(containerId, logCheckboxId) {
    const container = document.getElementById(containerId);
    const logCheckbox = document.getElementById(logCheckboxId);
    if (!container) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'static-chart-canvas';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Load data
    let data;
    try {
        const resp = await fetch('/data/milwaukee_binned.json');
        data = await resp.json();
    } catch (e) {
        container.innerHTML = '<p>Failed to load home sales data</p>';
        return;
    }

    const brackets = data.bins;
    const totalHomes = data.total;
    const medianValue = 225000;  // From data analysis

    function getColors() {
        const isDark = document.documentElement.classList.contains('darkmode') ||
                       window.matchMedia('(prefers-color-scheme: dark)').matches;
        return {
            axis: isDark ? '#a89984' : '#7c6f64',
            text: isDark ? '#d5c4a1' : '#504945',
            bar: isDark ? 'rgba(104, 157, 106, 0.7)' : 'rgba(76, 175, 80, 0.7)',
            barStroke: isDark ? 'rgba(104, 157, 106, 1)' : 'rgba(76, 175, 80, 1)',
            median: '#e67e22'
        };
    }

    let width, height;
    let useLogScale = false;

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
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
        return `$${value}`;
    }

    function draw() {
        const colors = getColors();
        const padding = { top: 20, right: 20, bottom: 50, left: 50 };
        const plotW = width - padding.left - padding.right;
        const plotH = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);

        // Convert counts to density (count per $1000 range for fair comparison)
        const densities = brackets.map(b => ({
            ...b,
            mid: (b.min + b.max) / 2,
            density: b.count / ((b.max - b.min) / 1000)
        }));

        const maxDensity = Math.max(...densities.map(d => d.density));

        let xMin, xMax;
        if (useLogScale) {
            xMin = Math.log10(10000);   // $10k
            xMax = Math.log10(3000000); // $3M
        } else {
            xMin = 0;
            xMax = 1500000; // $1.5M to show main distribution
        }

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

        if (useLogScale) {
            const logTicks = [10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2000000];
            for (const val of logTicks) {
                const logVal = Math.log10(val);
                if (logVal < xMin || logVal > xMax) continue;
                const px = padding.left + ((logVal - xMin) / (xMax - xMin)) * plotW;
                ctx.fillText(formatMoney(val), px, height - padding.bottom + 8);
                ctx.beginPath();
                ctx.moveTo(px, height - padding.bottom);
                ctx.lineTo(px, height - padding.bottom + 4);
                ctx.stroke();
            }
        } else {
            for (let val = 0; val <= xMax; val += 250000) {
                const px = padding.left + ((val - xMin) / (xMax - xMin)) * plotW;
                ctx.fillText(formatMoney(val), px, height - padding.bottom + 8);
                ctx.beginPath();
                ctx.moveTo(px, height - padding.bottom);
                ctx.lineTo(px, height - padding.bottom + 4);
                ctx.stroke();
            }
        }

        ctx.font = '12px system-ui, sans-serif';
        const xLabel = useLogScale ? 'Home Value (log scale)' : 'Home Value';
        ctx.fillText(xLabel, padding.left + plotW / 2, height - 12);

        // Y-axis title
        ctx.save();
        ctx.translate(15, padding.top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Homes (millions)', 0, 0);
        ctx.restore();

        // Y-axis labels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = '10px system-ui, sans-serif';

        // Draw bars
        ctx.fillStyle = colors.bar;
        ctx.strokeStyle = colors.barStroke;
        ctx.lineWidth = 1;

        for (const bracket of brackets) {
            let barLeft, barRight;

            if (useLogScale) {
                const logMin = Math.log10(Math.max(bracket.min, 1000));
                const logMax = Math.log10(bracket.max);
                barLeft = padding.left + ((logMin - xMin) / (xMax - xMin)) * plotW;
                barRight = padding.left + ((logMax - xMin) / (xMax - xMin)) * plotW;
            } else {
                barLeft = padding.left + ((bracket.min - xMin) / (xMax - xMin)) * plotW;
                barRight = padding.left + ((bracket.max - xMin) / (xMax - xMin)) * plotW;
            }

            // Skip if off screen
            if (barRight < padding.left || barLeft > padding.left + plotW) continue;

            // Clamp to visible area
            barLeft = Math.max(barLeft, padding.left);
            barRight = Math.min(barRight, padding.left + plotW);

            const barWidth = barRight - barLeft;
            const barHeight = (bracket.count / totalHomes) * plotH * 8; // Scale for visibility

            ctx.fillRect(barLeft, height - padding.bottom - barHeight, barWidth, barHeight);
            ctx.strokeRect(barLeft, height - padding.bottom - barHeight, barWidth, barHeight);
        }

        // Draw median line
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = colors.median;
        ctx.lineWidth = 2;

        let medianPx;
        if (useLogScale) {
            medianPx = padding.left + ((Math.log10(medianValue) - xMin) / (xMax - xMin)) * plotW;
        } else {
            medianPx = padding.left + ((medianValue - xMin) / (xMax - xMin)) * plotW;
        }

        ctx.beginPath();
        ctx.moveTo(medianPx, padding.top);
        ctx.lineTo(medianPx, height - padding.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        // Legend
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const legendX = width - padding.right - 130;
        const legendY = padding.top + 15;

        ctx.strokeStyle = colors.median;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(legendX, legendY);
        ctx.lineTo(legendX + 20, legendY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = colors.text;
        ctx.fillText(`Median: ${formatMoney(medianValue)}`, legendX + 26, legendY);
    }

    // Checkbox handler
    if (logCheckbox) {
        logCheckbox.addEventListener('change', () => {
            useLogScale = logCheckbox.checked;
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
