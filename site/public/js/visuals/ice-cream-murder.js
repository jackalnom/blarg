import { getThemeColors, listenForThemeChange } from "./utils.js";

export function initIceCreamMurder(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Create layout
    container.innerHTML = `
        <div class="icecream-chart-container"></div>
        <div class="static-chart-source">Note: Synthetic data based on documented seasonal patterns. The correlation between temperature and violent crime is well-established (see Ranson, 2014, "Crime, weather, and climate change," Journal of Environmental Economics and Management).</div>
    `;

    const chartContainer = container.querySelector('.icecream-chart-container');
    const canvas = document.createElement('canvas');
    canvas.className = 'static-chart-canvas';
    chartContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Realistic monthly data (approximate real patterns)
    // Ice cream sales index (0-100), Murder rate per 100k (annualized)
    const monthlyData = [
        { month: 'Jan', iceCream: 15, murder: 4.2, temp: 32 },
        { month: 'Feb', iceCream: 18, murder: 4.0, temp: 35 },
        { month: 'Mar', iceCream: 28, murder: 4.5, temp: 45 },
        { month: 'Apr', iceCream: 42, murder: 4.8, temp: 55 },
        { month: 'May', iceCream: 58, murder: 5.2, temp: 65 },
        { month: 'Jun', iceCream: 78, murder: 5.8, temp: 75 },
        { month: 'Jul', iceCream: 95, murder: 6.2, temp: 82 },
        { month: 'Aug', iceCream: 92, murder: 6.0, temp: 80 },
        { month: 'Sep', iceCream: 65, murder: 5.5, temp: 70 },
        { month: 'Oct', iceCream: 38, murder: 4.9, temp: 58 },
        { month: 'Nov', iceCream: 22, murder: 4.4, temp: 45 },
        { month: 'Dec', iceCream: 12, murder: 4.1, temp: 35 },
    ];

    // Add some noise/variation for multiple years
    const data = [];
    for (let year = 0; year < 5; year++) {
        for (const d of monthlyData) {
            data.push({
                iceCream: d.iceCream + (Math.random() - 0.5) * 15,
                murder: d.murder + (Math.random() - 0.5) * 0.8,
                month: d.month
            });
        }
    }

    function setupCanvas(canvas, aspectRatio) {
        const dpr = window.devicePixelRatio || 1;
        const container = canvas.parentElement;
        const displayWidth = container.clientWidth;
        const displayHeight = Math.round(displayWidth / aspectRatio);

        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        return { width: displayWidth, height: displayHeight };
    }

    function draw() {
        const colors = getThemeColors();
        const dims = setupCanvas(canvas, 2); // 2:1 aspect ratio
        const { width, height } = dims;
        const padding = { top: 20, right: 20, bottom: 45, left: 55 };
        const plotW = width - padding.left - padding.right;
        const plotH = height - padding.top - padding.bottom;

        // Clear and fill background
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, width, height);

        // Data ranges
        const xMin = 0, xMax = 110;
        const yMin = 3.5, yMax = 7;

        // Draw axes
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // X-axis labels
        ctx.fillStyle = colors.fg;
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let x = 0; x <= 100; x += 25) {
            const px = padding.left + (x / xMax) * plotW;
            ctx.fillText(x.toString(), px, height - padding.bottom + 8);

            // Tick
            ctx.beginPath();
            ctx.moveTo(px, height - padding.bottom);
            ctx.lineTo(px, height - padding.bottom + 4);
            ctx.stroke();
        }
        ctx.fillText('Ice Cream Sales Index', padding.left + plotW / 2, height - 12);

        // Y-axis labels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let y = 4; y <= 6.5; y += 0.5) {
            const py = height - padding.bottom - ((y - yMin) / (yMax - yMin)) * plotH;
            ctx.fillText(y.toFixed(1), padding.left - 8, py);

            // Tick
            ctx.beginPath();
            ctx.moveTo(padding.left - 4, py);
            ctx.lineTo(padding.left, py);
            ctx.stroke();
        }

        // Y-axis title (rotated)
        ctx.save();
        ctx.translate(15, padding.top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Murder Rate (per 100k)', 0, 0);
        ctx.restore();

        // Calculate regression for the line
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (const d of data) {
            sumX += d.iceCream;
            sumY += d.murder;
            sumXY += d.iceCream * d.murder;
            sumX2 += d.iceCream * d.iceCream;
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Draw points first
        ctx.fillStyle = colors.trendLine;
        ctx.globalAlpha = 0.7;
        for (const d of data) {
            const px = padding.left + ((d.iceCream - xMin) / (xMax - xMin)) * plotW;
            const py = height - padding.bottom - ((d.murder - yMin) / (yMax - yMin)) * plotH;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Calculate R²
        let meanY = sumY / n;
        let ssTotal = 0, ssRes = 0;
        for (const d of data) {
            const predicted = slope * d.iceCream + intercept;
            ssTotal += (d.murder - meanY) ** 2;
            ssRes += (d.murder - predicted) ** 2;
        }
        const r2 = 1 - ssRes / ssTotal;

        // Show R²
        ctx.fillStyle = colors.fg;
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`R² = ${r2.toFixed(2)}`, width - padding.right - 10, padding.top + 10);
    }

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(draw, 100);
    });

    // Initial draw
    draw();

    listenForThemeChange(() => {
        draw();
    });
}
