/**
 * California Electricity Demand - Four weeks stacked to show daily/weekly patterns
 * Data source: EIA Form 930, California region, 2023
 */
export async function initElectricityDemand(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Create layout - single canvas with 4 stacked weeks
    container.innerHTML = `
        <div class="elec-main-chart"></div>
        <div class="elec-source">Source: U.S. Energy Information Administration, Form EIA-930 (California, October 2023)</div>
    `;

    const mainContainer = container.querySelector('.elec-main-chart');
    const mainCanvas = document.createElement('canvas');
    mainCanvas.className = 'elec-main-canvas';
    mainContainer.appendChild(mainCanvas);
    const ctx = mainCanvas.getContext('2d');

    // Load data
    let data;
    try {
        const resp = await fetch('/data/cal_demand_2023.json');
        data = await resp.json();
    } catch (e) {
        container.innerHTML = '<p>Failed to load electricity data</p>';
        return;
    }

    const allValues = data.values;

    // Extract 4 weeks starting October 1, 2023 (Sunday) through October 28
    // October 1, 2023 is day 273 (0-indexed from Jan 1)
    const weekStartHour = 273 * 24;
    const weeks = [
        { label: 'Oct 1–7', values: allValues.slice(weekStartHour, weekStartHour + 168) },
        { label: 'Oct 8–14', values: allValues.slice(weekStartHour + 168, weekStartHour + 336) },
        { label: 'Oct 15–21', values: allValues.slice(weekStartHour + 336, weekStartHour + 504) },
        { label: 'Oct 22–28', values: allValues.slice(weekStartHour + 504, weekStartHour + 672) }
    ];

    function getColors() {
        const isDark = document.documentElement.classList.contains('darkmode') ||
                       window.matchMedia('(prefers-color-scheme: dark)').matches;
        return {
            axis: isDark ? '#a89984' : '#7c6f64',
            text: isDark ? '#d5c4a1' : '#504945',
            line: isDark ? 'rgba(131, 165, 152, 1)' : 'rgba(66, 123, 88, 1)',
            fill: isDark ? 'rgba(131, 165, 152, 0.25)' : 'rgba(66, 123, 88, 0.18)',
            grid: isDark ? 'rgba(168, 153, 132, 0.3)' : 'rgba(124, 111, 100, 0.2)',
            weekend: isDark ? 'rgba(211, 134, 155, 0.15)' : 'rgba(211, 134, 155, 0.12)'
        };
    }

    function setupCanvas(canvas, aspectRatio) {
        const container = canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = container.clientWidth;
        const displayHeight = Math.round(displayWidth / aspectRatio);

        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
        canvas.width = Math.floor(displayWidth * dpr);
        canvas.height = Math.floor(displayHeight * dpr);

        const ctx = canvas.getContext('2d');
        ctx.resetTransform();
        ctx.scale(dpr, dpr);

        return { width: displayWidth, height: displayHeight };
    }

    function draw() {
        const colors = getColors();
        const dims = setupCanvas(mainCanvas, 1.4); // Taller for 4 rows
        const { width, height } = dims;
        const padding = { top: 25, right: 15, bottom: 30, left: 55 };
        const plotW = width - padding.left - padding.right;
        const totalPlotH = height - padding.top - padding.bottom;
        const rowGap = 8;
        const rowH = (totalPlotH - rowGap * 3) / 4;

        ctx.clearRect(0, 0, width, height);

        // Find global min/max across all weeks for consistent scale
        const allWeekValues = weeks.flatMap(w => w.values);
        const minVal = Math.min(...allWeekValues);
        const maxVal = Math.max(...allWeekValues);
        const yMin = Math.floor(minVal / 5000) * 5000;
        const yMax = Math.ceil(maxVal / 5000) * 5000;

        // Draw day labels at top (only once)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        ctx.fillStyle = colors.text;
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        days.forEach((day, i) => {
            const px = padding.left + ((i + 0.5) * 24 / 168) * plotW;
            ctx.fillText(day, px, padding.top - 8);
        });

        // Draw each week as a row
        weeks.forEach((week, rowIndex) => {
            const rowTop = padding.top + rowIndex * (rowH + rowGap);

            // Shade weekend columns
            ctx.fillStyle = colors.weekend;
            ctx.fillRect(padding.left, rowTop, (24 / 168) * plotW, rowH); // Sunday
            ctx.fillRect(padding.left + (144 / 168) * plotW, rowTop, (24 / 168) * plotW, rowH); // Saturday

            // Draw vertical grid lines at midnight
            ctx.strokeStyle = colors.grid;
            ctx.lineWidth = 1;
            for (let day = 0; day <= 7; day++) {
                const px = padding.left + (day * 24 / 168) * plotW;
                ctx.beginPath();
                ctx.moveTo(px, rowTop);
                ctx.lineTo(px, rowTop + rowH);
                ctx.stroke();
            }

            // Draw row border
            ctx.strokeStyle = colors.axis;
            ctx.lineWidth = 1;
            ctx.strokeRect(padding.left, rowTop, plotW, rowH);

            // Draw week label on left
            ctx.fillStyle = colors.text;
            ctx.font = '10px system-ui, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(week.label, padding.left - 8, rowTop + rowH / 2);

            // Draw data line
            ctx.beginPath();
            for (let i = 0; i < week.values.length; i++) {
                const px = padding.left + (i / 168) * plotW;
                const py = rowTop + rowH - ((week.values[i] - yMin) / (yMax - yMin)) * rowH;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = colors.line;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Fill under curve
            ctx.lineTo(padding.left + plotW, rowTop + rowH);
            ctx.lineTo(padding.left, rowTop + rowH);
            ctx.closePath();
            ctx.fillStyle = colors.fill;
            ctx.fill();
        });

        // Y-axis scale indicator (just show range once on left)
        ctx.fillStyle = colors.text;
        ctx.font = '9px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${(yMin/1000).toFixed(0)}k–${(yMax/1000).toFixed(0)}k MWh`, padding.left, height - padding.bottom + 10);
    }

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(draw, 100);
    });

    draw();
}
