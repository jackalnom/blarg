/**
 * US Income distribution chart
 * Shows the right-skewed nature of income and log-normal transformation
 */
export function initIncomeDistribution(containerId, logCheckboxId) {
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

    // US Household Income parameters (log-normal distribution)
    // Based on US Census data 2022-2023
    // Median: ~$75,000, Mean: ~$105,000
    // In log space: mu ≈ 11.15 (ln($70k)), sigma ≈ 0.85
    const incomeParams = {
        mu: 11.15,      // log-space mean
        sigma: 0.85,    // log-space std
        color: 'rgba(76, 175, 80, 0.6)',
        stroke: 'rgba(76, 175, 80, 1)'
    };

    // Log-normal PDF
    function logNormalPDF(x, mu, sigma) {
        if (x <= 0) return 0;
        const logX = Math.log(x);
        const z = (logX - mu) / sigma;
        return Math.exp(-0.5 * z * z) / (x * sigma * Math.sqrt(2 * Math.PI));
    }

    // Normal PDF (for log-transformed view)
    function normalPDF(x, mu, sigma) {
        const z = (x - mu) / sigma;
        return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
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
        const padding = { top: 20, right: 20, bottom: 50, left: 55 };
        const plotW = width - padding.left - padding.right;
        const plotH = height - padding.top - padding.bottom;

        // Clear
        ctx.clearRect(0, 0, width, height);

        const step = useLogScale ? 0.05 : 1000;
        let xMin, xMax, yMax;

        if (useLogScale) {
            // Log scale: show ln(income) from ln($10k) to ln($500k)
            xMin = Math.log(10000);   // ~9.2
            xMax = Math.log(500000);  // ~13.1

            // Calculate y max
            yMax = normalPDF(incomeParams.mu, incomeParams.mu, incomeParams.sigma) * 1.1;
        } else {
            // Linear scale: $0 to $400k
            xMin = 0;
            xMax = 400000;

            // Calculate y max (peak of log-normal)
            const mode = Math.exp(incomeParams.mu - incomeParams.sigma * incomeParams.sigma);
            yMax = logNormalPDF(mode, incomeParams.mu, incomeParams.sigma) * 1.1;
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
            // Log scale ticks at $10k, $25k, $50k, $100k, $200k, $400k
            const logTicks = [10000, 25000, 50000, 100000, 200000, 400000];
            for (const val of logTicks) {
                const logVal = Math.log(val);
                const px = padding.left + ((logVal - xMin) / (xMax - xMin)) * plotW;
                ctx.fillText(formatMoney(val), px, height - padding.bottom + 8);

                ctx.beginPath();
                ctx.moveTo(px, height - padding.bottom);
                ctx.lineTo(px, height - padding.bottom + 4);
                ctx.stroke();
            }
        } else {
            // Linear scale ticks
            for (let val = 0; val <= 400000; val += 100000) {
                const px = padding.left + ((val - xMin) / (xMax - xMin)) * plotW;
                ctx.fillText(formatMoney(val), px, height - padding.bottom + 8);

                ctx.beginPath();
                ctx.moveTo(px, height - padding.bottom);
                ctx.lineTo(px, height - padding.bottom + 4);
                ctx.stroke();
            }
        }

        ctx.font = '12px system-ui, sans-serif';
        const xLabel = useLogScale ? 'Household Income (log scale)' : 'Household Income';
        ctx.fillText(xLabel, padding.left + plotW / 2, height - 12);

        // Y-axis title
        ctx.save();
        ctx.translate(15, padding.top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Density', 0, 0);
        ctx.restore();

        // Draw distribution
        ctx.fillStyle = incomeParams.color;
        ctx.strokeStyle = incomeParams.stroke;
        ctx.lineWidth = 2;

        ctx.beginPath();
        let first = true;

        if (useLogScale) {
            // Draw normal distribution in log space
            for (let logX = xMin; logX <= xMax; logX += step) {
                const y = normalPDF(logX, incomeParams.mu, incomeParams.sigma);
                const px = padding.left + ((logX - xMin) / (xMax - xMin)) * plotW;
                const py = height - padding.bottom - (y / yMax) * plotH;

                if (first) {
                    ctx.moveTo(px, height - padding.bottom);
                    ctx.lineTo(px, py);
                    first = false;
                } else {
                    ctx.lineTo(px, py);
                }
            }
        } else {
            // Draw log-normal distribution
            for (let x = Math.max(1000, xMin); x <= xMax; x += step) {
                const y = logNormalPDF(x, incomeParams.mu, incomeParams.sigma);
                const px = padding.left + ((x - xMin) / (xMax - xMin)) * plotW;
                const py = height - padding.bottom - (y / yMax) * plotH;

                if (first) {
                    ctx.moveTo(px, height - padding.bottom);
                    ctx.lineTo(px, py);
                    first = false;
                } else {
                    ctx.lineTo(px, py);
                }
            }
        }

        ctx.lineTo(padding.left + plotW, height - padding.bottom);
        ctx.closePath();
        ctx.fill();

        // Draw stroke
        ctx.beginPath();
        first = true;
        if (useLogScale) {
            for (let logX = xMin; logX <= xMax; logX += step) {
                const y = normalPDF(logX, incomeParams.mu, incomeParams.sigma);
                const px = padding.left + ((logX - xMin) / (xMax - xMin)) * plotW;
                const py = height - padding.bottom - (y / yMax) * plotH;

                if (first) {
                    ctx.moveTo(px, py);
                    first = false;
                } else {
                    ctx.lineTo(px, py);
                }
            }
        } else {
            for (let x = Math.max(1000, xMin); x <= xMax; x += step) {
                const y = logNormalPDF(x, incomeParams.mu, incomeParams.sigma);
                const px = padding.left + ((x - xMin) / (xMax - xMin)) * plotW;
                const py = height - padding.bottom - (y / yMax) * plotH;

                if (first) {
                    ctx.moveTo(px, py);
                    first = false;
                } else {
                    ctx.lineTo(px, py);
                }
            }
        }
        ctx.stroke();

        // Draw median and mean markers
        const median = Math.exp(incomeParams.mu);
        const mean = Math.exp(incomeParams.mu + incomeParams.sigma * incomeParams.sigma / 2);

        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;

        // Median line
        let medianPx;
        if (useLogScale) {
            medianPx = padding.left + ((Math.log(median) - xMin) / (xMax - xMin)) * plotW;
        } else {
            medianPx = padding.left + ((median - xMin) / (xMax - xMin)) * plotW;
        }
        ctx.strokeStyle = '#e67e22';
        ctx.beginPath();
        ctx.moveTo(medianPx, padding.top);
        ctx.lineTo(medianPx, height - padding.bottom);
        ctx.stroke();

        // Mean line
        let meanPx;
        if (useLogScale) {
            meanPx = padding.left + ((Math.log(mean) - xMin) / (xMax - xMin)) * plotW;
        } else {
            meanPx = padding.left + ((mean - xMin) / (xMax - xMin)) * plotW;
        }
        ctx.strokeStyle = '#9b59b6';
        ctx.beginPath();
        ctx.moveTo(meanPx, padding.top);
        ctx.lineTo(meanPx, height - padding.bottom);
        ctx.stroke();

        ctx.setLineDash([]);

        // Legend
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const legendX = width - padding.right - 120;
        const legendY = padding.top + 15;

        ctx.strokeStyle = '#e67e22';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(legendX, legendY);
        ctx.lineTo(legendX + 20, legendY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = colors.text;
        ctx.fillText(`Median: ${formatMoney(Math.round(median))}`, legendX + 26, legendY);

        ctx.strokeStyle = '#9b59b6';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(legendX, legendY + 18);
        ctx.lineTo(legendX + 20, legendY + 18);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = colors.text;
        ctx.fillText(`Mean: ${formatMoney(Math.round(mean))}`, legendX + 26, legendY + 18);
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
