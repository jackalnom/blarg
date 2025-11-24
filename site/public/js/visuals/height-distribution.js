/**
 * Human height distribution chart
 * Shows combined distribution that can be split by gender
 */
export function initHeightDistribution(containerId, checkboxId) {
    const container = document.getElementById(containerId);
    const checkbox = document.getElementById(checkboxId);
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

    // Height distribution parameters (in inches)
    // Based on CDC NHANES data for US adults 20+
    // Male: mean 69.1" (5'9.1"), std 2.9"
    // Female: mean 63.7" (5'3.7"), std 2.8"
    const distributions = {
        male: { mean: 69.1, std: 2.9, color: 'rgba(74, 144, 226, 0.6)', stroke: 'rgba(74, 144, 226, 1)', label: 'Male' },
        female: { mean: 63.7, std: 2.8, color: 'rgba(226, 74, 144, 0.6)', stroke: 'rgba(226, 74, 144, 1)', label: 'Female' }
    };

    // Generate PDF values
    function normalPDF(x, mean, std) {
        const z = (x - mean) / std;
        return Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI));
    }

    let width, height;
    let splitByGender = false;

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

    function draw() {
        const colors = getColors();
        const padding = { top: 20, right: 20, bottom: 50, left: 50 };
        const plotW = width - padding.left - padding.right;
        const plotH = height - padding.top - padding.bottom;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // X range: 55 to 80 inches (4'7" to 6'8")
        const xMin = 55, xMax = 80;
        const step = 0.25;

        // Calculate y max based on mode
        let yMax = 0;
        if (splitByGender) {
            for (const dist of Object.values(distributions)) {
                const peakY = normalPDF(dist.mean, dist.mean, dist.std);
                yMax = Math.max(yMax, peakY);
            }
        } else {
            // Combined distribution
            for (let x = xMin; x <= xMax; x += step) {
                const y = 0.5 * normalPDF(x, distributions.male.mean, distributions.male.std) +
                         0.5 * normalPDF(x, distributions.female.mean, distributions.female.std);
                yMax = Math.max(yMax, y);
            }
        }
        yMax *= 1.1; // Add headroom

        // Draw axes
        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // X-axis labels (convert to feet/inches)
        ctx.fillStyle = colors.text;
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        for (let inches = 56; inches <= 78; inches += 2) {
            const feet = Math.floor(inches / 12);
            const remainingInches = inches % 12;
            const label = `${feet}'${remainingInches}"`;
            const px = padding.left + ((inches - xMin) / (xMax - xMin)) * plotW;

            ctx.fillText(label, px, height - padding.bottom + 8);

            // Tick
            ctx.beginPath();
            ctx.moveTo(px, height - padding.bottom);
            ctx.lineTo(px, height - padding.bottom + 4);
            ctx.stroke();
        }

        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText('Height', padding.left + plotW / 2, height - 12);

        // Y-axis title
        ctx.save();
        ctx.translate(15, padding.top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Density', 0, 0);
        ctx.restore();

        // Draw distributions
        if (splitByGender) {
            // Draw each gender separately
            for (const dist of Object.values(distributions)) {
                drawDistribution(dist, xMin, xMax, yMax, padding, plotW, plotH, step);
            }

            // Legend
            ctx.font = '12px system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            const legendX = width - padding.right - 90;
            const legendY = padding.top + 20;

            ctx.fillStyle = distributions.male.color;
            ctx.fillRect(legendX, legendY - 6, 16, 12);
            ctx.fillStyle = colors.text;
            ctx.fillText('Male', legendX + 22, legendY);

            ctx.fillStyle = distributions.female.color;
            ctx.fillRect(legendX, legendY + 14, 16, 12);
            ctx.fillStyle = colors.text;
            ctx.fillText('Female', legendX + 22, legendY + 20);
        } else {
            // Combined distribution
            drawCombinedDistribution(xMin, xMax, yMax, padding, plotW, plotH, step, colors);
        }
    }

    function drawDistribution(dist, xMin, xMax, yMax, padding, plotW, plotH, step) {
        ctx.fillStyle = dist.color;
        ctx.strokeStyle = dist.color.replace('0.6', '1');
        ctx.lineWidth = 2;

        ctx.beginPath();
        let first = true;
        for (let x = xMin; x <= xMax; x += step) {
            const y = normalPDF(x, dist.mean, dist.std);
            const px = padding.left + ((x - xMin) / (xMax - xMin)) * plotW;
            const py = height - padding.top - padding.bottom - (y / yMax) * plotH + padding.top;

            if (first) {
                ctx.moveTo(px, height - padding.bottom);
                ctx.lineTo(px, py);
                first = false;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.lineTo(padding.left + plotW, height - padding.bottom);
        ctx.closePath();
        ctx.fill();

        // Draw stroke on top
        ctx.beginPath();
        first = true;
        for (let x = xMin; x <= xMax; x += step) {
            const y = normalPDF(x, dist.mean, dist.std);
            const px = padding.left + ((x - xMin) / (xMax - xMin)) * plotW;
            const py = height - padding.top - padding.bottom - (y / yMax) * plotH + padding.top;

            if (first) {
                ctx.moveTo(px, py);
                first = false;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
    }

    function drawCombinedDistribution(xMin, xMax, yMax, padding, plotW, plotH, step, colors) {
        ctx.fillStyle = 'rgba(130, 100, 180, 0.5)';
        ctx.strokeStyle = 'rgba(130, 100, 180, 1)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        let first = true;
        for (let x = xMin; x <= xMax; x += step) {
            const y = 0.5 * normalPDF(x, distributions.male.mean, distributions.male.std) +
                     0.5 * normalPDF(x, distributions.female.mean, distributions.female.std);
            const px = padding.left + ((x - xMin) / (xMax - xMin)) * plotW;
            const py = height - padding.top - padding.bottom - (y / yMax) * plotH + padding.top;

            if (first) {
                ctx.moveTo(px, height - padding.bottom);
                ctx.lineTo(px, py);
                first = false;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.lineTo(padding.left + plotW, height - padding.bottom);
        ctx.closePath();
        ctx.fill();

        // Draw stroke
        ctx.beginPath();
        first = true;
        for (let x = xMin; x <= xMax; x += step) {
            const y = 0.5 * normalPDF(x, distributions.male.mean, distributions.male.std) +
                     0.5 * normalPDF(x, distributions.female.mean, distributions.female.std);
            const px = padding.left + ((x - xMin) / (xMax - xMin)) * plotW;
            const py = height - padding.top - padding.bottom - (y / yMax) * plotH + padding.top;

            if (first) {
                ctx.moveTo(px, py);
                first = false;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();

        // Label showing it's combined
        ctx.fillStyle = colors.textLight;
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('Combined', width - padding.right - 10, padding.top + 10);
    }

    // Checkbox handler
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            splitByGender = checkbox.checked;
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
