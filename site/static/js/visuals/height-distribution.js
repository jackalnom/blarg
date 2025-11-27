import { getThemeColors, listenForThemeChange } from "./utils.js";

/**
 * Human height distribution chart from NHANES data
 * Data source: CDC National Health and Nutrition Examination Survey (NHANES) 2017-2020
 * Shows combined distribution that can be split by gender
 */
export async function initHeightDistribution(containerId, checkboxId) {
    const container = document.getElementById(containerId);
    const checkbox = document.getElementById(checkboxId);
    if (!container) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'static-chart-canvas';
    container.appendChild(canvas);

    // Add source citation
    const source = document.createElement('div');
    source.className = 'static-chart-source';
    source.textContent = 'Source: CDC National Health and Nutrition Examination Survey (NHANES) 2017-2020. Data represents measured heights of US adults age 20+.';
    container.appendChild(source);

    const ctx = canvas.getContext('2d');

    // Load NHANES data
    let heightData = { male: [], female: [] };
    try {
        const resp = await fetch('/data/height_by_gender.csv');
        const text = await resp.text();
        const lines = text.trim().split('\n').slice(1); // Skip header

        for (const line of lines) {
            const [heightCm, gender, count] = line.split('\t');
            const heightNum = parseFloat(heightCm);
            const countNum = parseInt(count) || 0;

            if (countNum > 0) {
                heightData[gender].push({ height: heightNum, count: countNum });
            }
        }
    } catch (e) {
        container.innerHTML = '<p>Failed to load height data</p>';
        console.error('Failed to load height data:', e);
        return;
    }

    const distributions = {
        male: {
            data: heightData.male,
            color: 'rgba(74, 144, 226, 0.6)',
            stroke: 'rgba(74, 144, 226, 1)',
            label: 'Male'
        },
        female: {
            data: heightData.female,
            color: 'rgba(226, 74, 144, 0.6)',
            stroke: 'rgba(226, 74, 144, 1)',
            label: 'Female'
        }
    };

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
        const colors = getThemeColors();
        const padding = { top: 20, right: 20, bottom: 50, left: 50 };
        const plotW = width - padding.left - padding.right;
        const plotH = height - padding.top - padding.bottom;

        // Clear and fill background
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, width, height);

        // X range: 132 to 201 cm to cover data range
        const xMin = 132, xMax = 201;

        // Calculate y max based on mode (max count)
        let yMax = 0;
        if (splitByGender) {
            for (const dist of Object.values(distributions)) {
                const maxCount = Math.max(...dist.data.map(d => d.count));
                yMax = Math.max(yMax, maxCount);
            }
        } else {
            // Combined: sum male and female counts at each height
            const combinedCounts = {};
            for (const gender of ['male', 'female']) {
                for (const point of distributions[gender].data) {
                    const h = point.height;
                    combinedCounts[h] = (combinedCounts[h] || 0) + point.count;
                }
            }
            yMax = Math.max(...Object.values(combinedCounts));
        }
        yMax *= 1.1; // Add headroom

        // Draw axes
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // X-axis labels (in cm)
        ctx.fillStyle = colors.fg;
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        for (let cm = 140; cm <= 200; cm += 10) {
            const px = padding.left + ((cm - xMin) / (xMax - xMin)) * plotW;

            ctx.fillText(`${cm}`, px, height - padding.bottom + 8);

            // Tick
            ctx.beginPath();
            ctx.moveTo(px, height - padding.bottom);
            ctx.lineTo(px, height - padding.bottom + 4);
            ctx.stroke();
        }

        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText('Height (cm)', padding.left + plotW / 2, height - 12);

        // Y-axis title
        ctx.save();
        ctx.translate(15, padding.top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Count', 0, 0);
        ctx.restore();

        // Draw distributions
        if (splitByGender) {
            // Draw each gender separately
            for (const dist of Object.values(distributions)) {
                drawDistribution(dist, xMin, xMax, yMax, padding, plotW, plotH);
            }

            // Legend
            ctx.font = '12px system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            const legendX = width - padding.right - 90;
            const legendY = padding.top + 20;

            ctx.fillStyle = distributions.male.color;
            ctx.fillRect(legendX, legendY - 6, 16, 12);
            ctx.fillStyle = colors.fg;
            ctx.fillText('Male', legendX + 22, legendY);

            ctx.fillStyle = distributions.female.color;
            ctx.fillRect(legendX, legendY + 14, 16, 12);
            ctx.fillStyle = colors.fg;
            ctx.fillText('Female', legendX + 22, legendY + 20);
        } else {
            // Combined distribution
            drawCombinedDistribution(xMin, xMax, yMax, padding, plotW, plotH, colors);
        }
    }

    function drawDistribution(dist, xMin, xMax, yMax, padding, plotW, plotH) {
        ctx.fillStyle = dist.color;
        ctx.strokeStyle = dist.stroke;
        ctx.lineWidth = 2;

        // Draw filled area
        ctx.beginPath();
        ctx.moveTo(padding.left, height - padding.bottom);

        for (const point of dist.data) {
            const px = padding.left + ((point.height - xMin) / (xMax - xMin)) * plotW;
            const py = height - padding.bottom - (point.count / yMax) * plotH;
            ctx.lineTo(px, py);
        }

        ctx.lineTo(padding.left + plotW, height - padding.bottom);
        ctx.closePath();
        ctx.fill();

        // Draw stroke on top
        ctx.beginPath();
        let first = true;
        for (const point of dist.data) {
            const px = padding.left + ((point.height - xMin) / (xMax - xMin)) * plotW;
            const py = height - padding.bottom - (point.count / yMax) * plotH;

            if (first) {
                ctx.moveTo(px, py);
                first = false;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
    }

    function drawCombinedDistribution(xMin, xMax, yMax, padding, plotW, plotH, colors) {
        // Combine counts at each height
        const combinedData = {};
        for (const gender of ['male', 'female']) {
            for (const point of distributions[gender].data) {
                const h = point.height;
                combinedData[h] = (combinedData[h] || 0) + point.count;
            }
        }

        // Sort by height
        const sortedData = Object.keys(combinedData)
            .map(h => ({ height: parseFloat(h), count: combinedData[h] }))
            .sort((a, b) => a.height - b.height);

        ctx.fillStyle = 'rgba(130, 100, 180, 0.5)';
        ctx.strokeStyle = 'rgba(130, 100, 180, 1)';
        ctx.lineWidth = 2;

        // Draw filled area
        ctx.beginPath();
        ctx.moveTo(padding.left, height - padding.bottom);

        for (const point of sortedData) {
            const px = padding.left + ((point.height - xMin) / (xMax - xMin)) * plotW;
            const py = height - padding.bottom - (point.count / yMax) * plotH;
            ctx.lineTo(px, py);
        }

        ctx.lineTo(padding.left + plotW, height - padding.bottom);
        ctx.closePath();
        ctx.fill();

        // Draw stroke on top
        ctx.beginPath();
        let first = true;
        for (const point of sortedData) {
            const px = padding.left + ((point.height - xMin) / (xMax - xMin)) * plotW;
            const py = height - padding.bottom - (point.count / yMax) * plotH;

            if (first) {
                ctx.moveTo(px, py);
                first = false;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();

        // Label showing it's combined
        ctx.fillStyle = colors.fg3;
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('Combined', width - padding.right - 10, padding.top + 10);
    }

    // Event listeners
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            splitByGender = checkbox.checked;
            draw();
        });
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resize, 100);
    });

    resize();

    listenForThemeChange(() => {
        draw();
    });
}
