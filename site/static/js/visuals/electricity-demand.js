/**
 * California Electricity Demand - Three years of daily data
 * Data source: EIA Form 930, California region
 */
export async function initElectricityDemand(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Create layout
    container.innerHTML = `
        <div class="elec-main-chart"></div>
        <div class="elec-source">Source: U.S. Energy Information Administration, Form EIA-930 (California, Nov 2022 - Nov 2025)</div>
    `;

    const mainContainer = container.querySelector('.elec-main-chart');
    const mainCanvas = document.createElement('canvas');
    mainCanvas.className = 'elec-main-canvas';
    mainContainer.appendChild(mainCanvas);
    const ctx = mainCanvas.getContext('2d');

    let hoveredDay = null;

    // Load and parse CSV data
    let dataPoints = [];
    try {
        const resp = await fetch('/data/daily_demand_ca.csv');
        const csvText = await resp.text();
        const lines = csvText.trim().split('\n');

        // Skip header (first line may have BOM)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Parse: "26Nov2022","614,216"
            const match = line.match(/^(.+?),\"?([\d,]+)\"?$/);
            if (match) {
                const dateStr = match[1].replace(/^"/, '');
                const demandStr = match[2].replace(/,/g, '');
                const demand = parseFloat(demandStr);

                // Parse date format: ddMmmyyyy
                const day = parseInt(dateStr.slice(0, 2));
                const monthStr = dateStr.slice(2, 5);
                const year = parseInt(dateStr.slice(5));

                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const month = months.indexOf(monthStr);

                const date = new Date(year, month, day);
                dataPoints.push({ date, demand });
            }
        }
    } catch (e) {
        container.innerHTML = '<p>Failed to load electricity data</p>';
        return;
    }

    if (dataPoints.length === 0) {
        container.innerHTML = '<p>No electricity data available</p>';
        return;
    }

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
        // Use shorter aspect ratio on mobile for better visibility
        const isMobile = window.innerWidth < 600;
        const aspectRatio = isMobile ? 2 : 3.5;
        const dims = setupCanvas(mainCanvas, aspectRatio);
        const { width, height } = dims;
        const padding = { top: 50, right: 20, bottom: 60, left: 70 };
        const plotW = width - padding.left - padding.right;
        const plotH = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);

        // Find min/max for scale
        const demands = dataPoints.map(d => d.demand);
        const minVal = Math.min(...demands);
        const maxVal = Math.max(...demands);
        const yMin = Math.floor(minVal / 50000) * 50000;
        const yMax = Math.ceil(maxVal / 50000) * 50000;

        // Draw axes
        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 1;
        ctx.strokeRect(padding.left, padding.top, plotW, plotH);

        // Y-axis labels and grid
        ctx.fillStyle = colors.text;
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const numYTicks = 5;
        for (let i = 0; i <= numYTicks; i++) {
            const val = yMin + (yMax - yMin) * (i / numYTicks);
            const py = padding.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;
            ctx.fillText(`${(val/1000).toFixed(0)}k`, padding.left - 8, py);

            // Horizontal grid line
            ctx.strokeStyle = colors.grid;
            ctx.beginPath();
            ctx.moveTo(padding.left, py);
            ctx.lineTo(width - padding.right, py);
            ctx.stroke();
        }

        // Y-axis label
        ctx.save();
        ctx.translate(20, padding.top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillStyle = colors.text;
        ctx.fillText('Daily Demand (MWh)', 0, 0);
        ctx.restore();

        // X-axis: draw year labels and vertical grid lines
        const firstDate = dataPoints[0].date;
        const lastDate = dataPoints[dataPoints.length - 1].date;
        const totalDays = dataPoints.length;

        // Draw vertical grid at start of each year
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.fillStyle = colors.text;
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const years = [2022, 2023, 2024, 2025];
        years.forEach(year => {
            // Find first data point in this year
            const idx = dataPoints.findIndex(d => d.date.getFullYear() === year);
            if (idx >= 0) {
                const px = padding.left + (idx / totalDays) * plotW;
                ctx.strokeStyle = colors.grid;
                ctx.beginPath();
                ctx.moveTo(px, padding.top);
                ctx.lineTo(px, height - padding.bottom);
                ctx.stroke();

                // Label at middle of year
                const yearStart = dataPoints.findIndex(d => d.date.getFullYear() === year);
                const yearEnd = dataPoints.findIndex(d => d.date.getFullYear() === year + 1);
                const yearMid = yearEnd === -1 ? (yearStart + dataPoints.length) / 2 : (yearStart + yearEnd) / 2;
                const midPx = padding.left + (yearMid / totalDays) * plotW;

                ctx.fillStyle = colors.text;
                ctx.fillText(year.toString(), midPx, height - padding.bottom + 8);
            }
        });

        // Draw data line
        ctx.beginPath();
        for (let i = 0; i < dataPoints.length; i++) {
            const px = padding.left + (i / totalDays) * plotW;
            const py = padding.top + plotH - ((dataPoints[i].demand - yMin) / (yMax - yMin)) * plotH;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Fill under curve
        ctx.lineTo(padding.left + plotW, height - padding.bottom);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = colors.fill;
        ctx.fill();

        // Draw hover tooltip
        if (hoveredDay !== null && hoveredDay >= 0 && hoveredDay < dataPoints.length) {
            const point = dataPoints[hoveredDay];
            const px = padding.left + (hoveredDay / totalDays) * plotW;
            const py = padding.top + plotH - ((point.demand - yMin) / (yMax - yMin)) * plotH;

            // Draw vertical line at hover point
            ctx.strokeStyle = colors.axis;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(px, padding.top);
            ctx.lineTo(px, height - padding.bottom);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw point
            ctx.fillStyle = colors.line;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();

            // Format date
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const dateStr = `${monthNames[point.date.getMonth()]} ${point.date.getDate()}, ${point.date.getFullYear()}`;
            const valueStr = `${(point.demand / 1000).toFixed(1)}k MWh`;

            // Draw tooltip box
            ctx.font = '11px system-ui, sans-serif';
            const dateWidth = ctx.measureText(dateStr).width;
            const valueWidth = ctx.measureText(valueStr).width;
            const boxWidth = Math.max(dateWidth, valueWidth) + 16;
            const boxHeight = 36;

            let boxX = px + 10;
            let boxY = py - boxHeight / 2;

            // Keep tooltip on screen
            if (boxX + boxWidth > width - padding.right) {
                boxX = px - boxWidth - 10;
            }
            if (boxY < padding.top) {
                boxY = padding.top;
            }
            if (boxY + boxHeight > height - padding.bottom) {
                boxY = height - padding.bottom - boxHeight;
            }

            // Draw box
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
            ctx.strokeStyle = colors.axis;
            ctx.lineWidth = 1;
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

            // Draw text
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(dateStr, boxX + 8, boxY + 6);
            ctx.font = 'bold 11px system-ui, sans-serif';
            ctx.fillText(valueStr, boxX + 8, boxY + 20);
        }
    }

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(draw, 100);
    });

    // Handle hover
    mainCanvas.addEventListener('mousemove', (e) => {
        const rect = mainCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Get current dimensions
        const width = rect.width;
        const height = rect.height;
        const padding = { top: 50, right: 20, bottom: 60, left: 70 };
        const plotW = width - padding.left - padding.right;

        // Check if mouse is in plot area
        if (mouseX >= padding.left && mouseX <= width - padding.right &&
            mouseY >= padding.top && mouseY <= height - padding.bottom) {
            // Calculate which day
            const fraction = (mouseX - padding.left) / plotW;
            hoveredDay = Math.floor(fraction * dataPoints.length);
        } else {
            hoveredDay = null;
        }

        draw();
    });

    mainCanvas.addEventListener('mouseleave', () => {
        hoveredDay = null;
        draw();
    });

    draw();
}
