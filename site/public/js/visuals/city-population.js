import { getThemeColors } from "./utils.js";

/**
 * US City Population distribution (Zipf's Law)
 * Shows power-law using real Census data
 */
export function initCityPopulation(containerId, logCheckboxId) {
    const container = document.getElementById(containerId);
    const logCheckbox = document.getElementById(logCheckboxId);
    if (!container) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'static-chart-canvas';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Real US Census 2020 data - Top 100 cities by population
    const cities = [
        { rank: 1, name: "New York", pop: 8336817 },
        { rank: 2, name: "Los Angeles", pop: 3979576 },
        { rank: 3, name: "Chicago", pop: 2693976 },
        { rank: 4, name: "Houston", pop: 2320268 },
        { rank: 5, name: "Phoenix", pop: 1680992 },
        { rank: 6, name: "Philadelphia", pop: 1584064 },
        { rank: 7, name: "San Antonio", pop: 1547253 },
        { rank: 8, name: "San Diego", pop: 1423851 },
        { rank: 9, name: "Dallas", pop: 1343573 },
        { rank: 10, name: "San Jose", pop: 1021795 },
        { rank: 11, name: "Austin", pop: 978908 },
        { rank: 12, name: "Jacksonville", pop: 949611 },
        { rank: 13, name: "Fort Worth", pop: 918915 },
        { rank: 14, name: "Columbus", pop: 905748 },
        { rank: 15, name: "Indianapolis", pop: 887642 },
        { rank: 16, name: "Charlotte", pop: 874579 },
        { rank: 17, name: "San Francisco", pop: 873965 },
        { rank: 18, name: "Seattle", pop: 737015 },
        { rank: 19, name: "Denver", pop: 715522 },
        { rank: 20, name: "Washington", pop: 689545 },
        { rank: 21, name: "Nashville", pop: 689447 },
        { rank: 22, name: "Oklahoma City", pop: 681054 },
        { rank: 23, name: "El Paso", pop: 678815 },
        { rank: 24, name: "Boston", pop: 675647 },
        { rank: 25, name: "Portland", pop: 652503 },
        { rank: 26, name: "Las Vegas", pop: 641903 },
        { rank: 27, name: "Detroit", pop: 639111 },
        { rank: 28, name: "Memphis", pop: 633104 },
        { rank: 29, name: "Louisville", pop: 617638 },
        { rank: 30, name: "Baltimore", pop: 585708 },
        { rank: 31, name: "Milwaukee", pop: 577222 },
        { rank: 32, name: "Albuquerque", pop: 564559 },
        { rank: 33, name: "Tucson", pop: 542629 },
        { rank: 34, name: "Fresno", pop: 542107 },
        { rank: 35, name: "Sacramento", pop: 524943 },
        { rank: 36, name: "Kansas City", pop: 508090 },
        { rank: 37, name: "Mesa", pop: 504258 },
        { rank: 38, name: "Atlanta", pop: 498715 },
        { rank: 39, name: "Omaha", pop: 486051 },
        { rank: 40, name: "Colorado Springs", pop: 478961 },
        { rank: 41, name: "Raleigh", pop: 467665 },
        { rank: 42, name: "Long Beach", pop: 466742 },
        { rank: 43, name: "Virginia Beach", pop: 459470 },
        { rank: 44, name: "Miami", pop: 442241 },
        { rank: 45, name: "Oakland", pop: 433031 },
        { rank: 46, name: "Minneapolis", pop: 429954 },
        { rank: 47, name: "Tulsa", pop: 413066 },
        { rank: 48, name: "Bakersfield", pop: 403455 },
        { rank: 49, name: "Wichita", pop: 397532 },
        { rank: 50, name: "Arlington", pop: 394266 },
        // Extended with approximate data for ranks 51-200
        { rank: 60, pop: 340000 },
        { rank: 70, pop: 290000 },
        { rank: 80, pop: 255000 },
        { rank: 90, pop: 225000 },
        { rank: 100, pop: 200000 },
        { rank: 150, pop: 130000 },
        { rank: 200, pop: 95000 },
        { rank: 300, pop: 60000 },
        { rank: 500, pop: 35000 },
        { rank: 1000, pop: 15000 },
        { rank: 2000, pop: 6500 },
        { rank: 5000, pop: 2200 },
        { rank: 10000, pop: 900 },
        { rank: 19000, pop: 300 },  // ~19,000 incorporated places in US
    ];

    const chartParams = {
        color: 'rgba(66, 133, 244, 0.7)',
        stroke: 'rgba(66, 133, 244, 1)'
    };

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

    function formatPop(value) {
        if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
        if (value >= 1e3) return `${(value / 1e3).toFixed(0)}k`;
        return value.toString();
    }

    function draw() {
        const colors = getThemeColors();
        const padding = { top: 30, right: 20, bottom: 50, left: 60 };
        const plotW = width - padding.left - padding.right;
        const plotH = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);

        if (useLogLog) {
            drawLogLogPlot(colors, padding, plotW, plotH);
        } else {
            drawLinearPlot(colors, padding, plotW, plotH);
        }
    }

    function drawLinearPlot(colors, padding, plotW, plotH) {
        const top50 = cities.filter(c => c.rank <= 50);

        const xMax = 55;
        const yMax = 9000000;

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
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        for (let rank = 0; rank <= 50; rank += 10) {
            const px = padding.left + (rank / xMax) * plotW;
            ctx.fillText(rank === 0 ? '' : rank.toString(), px, height - padding.bottom + 8);
            ctx.beginPath();
            ctx.moveTo(px, height - padding.bottom);
            ctx.lineTo(px, height - padding.bottom + 4);
            ctx.stroke();
        }

        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText('City Rank', padding.left + plotW / 2, height - 12);

        // Y-axis labels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = '10px system-ui, sans-serif';

        for (let pop = 0; pop <= 8000000; pop += 2000000) {
            const py = height - padding.bottom - (pop / yMax) * plotH;
            ctx.fillText(formatPop(pop), padding.left - 8, py);
            ctx.beginPath();
            ctx.moveTo(padding.left - 4, py);
            ctx.lineTo(padding.left, py);
            ctx.stroke();
        }

        // Y-axis title
        ctx.save();
        ctx.translate(14, padding.top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText('Population', 0, 0);
        ctx.restore();

        // Draw bars
        const barWidth = plotW / xMax * 0.7;
        ctx.fillStyle = colors.point;

        for (const city of top50) {
            const px = padding.left + (city.rank / xMax) * plotW;
            const barHeight = (city.pop / yMax) * plotH;
            ctx.fillRect(px - barWidth / 2, height - padding.bottom - barHeight, barWidth, barHeight);
        }

        // Label top cities
        ctx.fillStyle = colors.fg;
        ctx.font = '9px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';

        const labeled = top50.filter(c => c.rank <= 5);
        for (const city of labeled) {
            const px = padding.left + (city.rank / xMax) * plotW;
            const py = height - padding.bottom - (city.pop / yMax) * plotH;
            ctx.save();
            ctx.translate(px + 3, py - 3);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(city.name, 0, 0);
            ctx.restore();
        }

        // Note
        ctx.fillStyle = colors.fg2;
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('US Census 2020', width - padding.right - 5, padding.top + 5);
    }

    function drawLogLogPlot(colors, padding, plotW, plotH) {
        const logXMin = 0;    // log10(1) = 0
        const logXMax = 4.3;  // log10(20000) ≈ 4.3
        const logYMin = 2;    // log10(100) = 2
        const logYMax = 7;    // log10(10M) = 7

        // Draw axes
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // X-axis labels (rank)
        ctx.fillStyle = colors.fg;
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const xTicks = [1, 10, 100, 1000, 10000];
        for (const val of xTicks) {
            const logVal = Math.log10(val);
            const px = padding.left + ((logVal - logXMin) / (logXMax - logXMin)) * plotW;
            ctx.fillText(val.toLocaleString(), px, height - padding.bottom + 8);
            ctx.beginPath();
            ctx.moveTo(px, height - padding.bottom);
            ctx.lineTo(px, height - padding.bottom + 4);
            ctx.stroke();
        }

        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText('City Rank (log scale)', padding.left + plotW / 2, height - 12);

        // Y-axis labels (population)
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = '10px system-ui, sans-serif';

        const yTicks = [1000, 10000, 100000, 1000000, 10000000];
        for (const val of yTicks) {
            const logVal = Math.log10(val);
            const py = height - padding.bottom - ((logVal - logYMin) / (logYMax - logYMin)) * plotH;
            ctx.fillText(formatPop(val), padding.left - 8, py);
            ctx.beginPath();
            ctx.moveTo(padding.left - 4, py);
            ctx.lineTo(padding.left, py);
            ctx.stroke();
        }

        // Y-axis title
        ctx.save();
        ctx.translate(14, padding.top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText('Population (log scale)', 0, 0);
        ctx.restore();

        // Draw data points
        ctx.fillStyle = colors.point;
        for (const city of cities) {
            const logX = Math.log10(city.rank);
            const logY = Math.log10(city.pop);

            if (logX < logXMin || logX > logXMax) continue;
            if (logY < logYMin || logY > logYMax) continue;

            const px = padding.left + ((logX - logXMin) / (logXMax - logXMin)) * plotW;
            const py = height - padding.bottom - ((logY - logYMin) / (logYMax - logYMin)) * plotH;

            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Zipf's Law reference line: pop = C / rank (slope = -1 on log-log)
        // Fit to NYC: C = 8.3M * 1 = 8.3M
        const C = 8336817;
        ctx.strokeStyle = colors.node;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);

        ctx.beginPath();
        for (let logR = logXMin; logR <= logXMax; logR += 0.1) {
            const rank = Math.pow(10, logR);
            const pop = C / rank;
            const logP = Math.log10(pop);

            if (logP < logYMin || logP > logYMax) continue;

            const px = padding.left + ((logR - logXMin) / (logXMax - logXMin)) * plotW;
            const py = height - padding.bottom - ((logP - logYMin) / (logYMax - logYMin)) * plotH;

            if (logR === logXMin || (rank === 1)) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Label a few cities
        ctx.fillStyle = colors.fg;
        ctx.font = '9px system-ui, sans-serif';
        const toLabel = cities.filter(c => [1, 2, 3, 10, 50].includes(c.rank) && c.name);
        for (const city of toLabel) {
            const logX = Math.log10(city.rank);
            const logY = Math.log10(city.pop);
            const px = padding.left + ((logX - logXMin) / (logXMax - logXMin)) * plotW;
            const py = height - padding.bottom - ((logY - logYMin) / (logYMax - logYMin)) * plotH;

            ctx.textAlign = city.rank === 1 ? 'left' : 'left';
            ctx.fillText(city.name, px + 6, py - 2);
        }
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
