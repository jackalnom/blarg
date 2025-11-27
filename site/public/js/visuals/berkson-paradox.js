/**
 * Berkson's Paradox Visualization
 * Shows inverse correlation due to selection bias
 */

import { getThemeColors, listenForThemeChange } from "./utils.js";

export function initBerksonParadox(config) {
    const dagCanvas = document.getElementById(config.dagCanvasId);
    const fullCanvas = document.getElementById(config.fullCanvasId);
    const selectedCanvas = document.getElementById(config.selectedCanvasId);
    const stepBtn = document.getElementById(config.stepId);
    const runBtn = document.getElementById(config.runId);
    const resetBtn = document.getElementById(config.resetId);
    const thresholdSlider = document.getElementById(config.thresholdId);
    const thresholdValue = document.getElementById(config.thresholdValueId);

    if (!dagCanvas || !fullCanvas || !selectedCanvas) return;

    const dagCtx = dagCanvas.getContext('2d');
    const fullCtx = fullCanvas.getContext('2d');
    const selectedCtx = selectedCanvas.getContext('2d');

    let data = [];
    let threshold = 100;
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
        drawDAG();
        drawScatterplots();
    }

    function step() {
        // Add 5 new random data points
        for (let i = 0; i < 5; i++) {
            const location = Math.random() * 100;
            const taste = Math.random() * 100;
            const selected = (location + taste) > threshold;
            data.push({ location, taste, selected });
        }

        // Stop simulation when we reach 200 points
        if (data.length >= 200) {
            running = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            runBtn.textContent = 'Run';
        }

        drawScatterplots();
    }

    function linearRegression(points) {
        const n = points.length;
        if (n === 0) return { slope: 0, intercept: 0 };

        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (const p of points) {
            sumX += p.location;
            sumY += p.taste;
            sumXY += p.location * p.taste;
            sumXX += p.location * p.location;
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        return { slope, intercept };
    }

    // getColors removed, using getThemeColors from utils.js

    function setupCanvas(canvas, aspectRatio) {
        const dpr = window.devicePixelRatio || 1;
        const container = canvas.parentElement;
        const displayWidth = container.clientWidth;
        const displayHeight = Math.round(displayWidth / aspectRatio);

        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';

        const ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        return { width: displayWidth, height: displayHeight };
    }

    function drawDAG() {
        const dims = setupCanvas(dagCanvas, 3);
        const { width, height } = dims;
        const colors = getThemeColors();

        dagCtx.clearRect(0, 0, width, height);
        dagCtx.fillStyle = colors.bg;
        dagCtx.fillRect(0, 0, width, height);

        const nodeRadius = 30;
        const centerX = width / 2;
        const spacing = 150;

        const nodes = {
            location: { x: centerX - spacing / 2, y: height * 0.65, label: 'Location' },
            taste: { x: centerX + spacing / 2, y: height * 0.65, label: 'Taste' },
            selection: { x: centerX, y: height * 0.35, label: 'Survives' }
        };

        // Draw edges (arrows)
        dagCtx.strokeStyle = colors.edge;
        dagCtx.fillStyle = colors.edge;
        dagCtx.lineWidth = 2;

        // Location -> Selection (diagonal upward)
        const locationAngle = Math.atan2(nodes.selection.y - nodes.location.y, nodes.selection.x - nodes.location.x);
        const locationStartX = nodes.location.x + nodeRadius * Math.cos(locationAngle);
        const locationStartY = nodes.location.y + nodeRadius * Math.sin(locationAngle);
        const locationEndX = nodes.selection.x - nodeRadius * Math.cos(locationAngle);
        const locationEndY = nodes.selection.y - nodeRadius * Math.sin(locationAngle);
        drawArrow(dagCtx, locationStartX, locationStartY, locationEndX, locationEndY);

        // Taste -> Selection (diagonal upward)
        const tasteAngle = Math.atan2(nodes.selection.y - nodes.taste.y, nodes.selection.x - nodes.taste.x);
        const tasteStartX = nodes.taste.x + nodeRadius * Math.cos(tasteAngle);
        const tasteStartY = nodes.taste.y + nodeRadius * Math.sin(tasteAngle);
        const tasteEndX = nodes.selection.x - nodeRadius * Math.cos(tasteAngle);
        const tasteEndY = nodes.selection.y - nodeRadius * Math.sin(tasteAngle);
        drawArrow(dagCtx, tasteStartX, tasteStartY, tasteEndX, tasteEndY);

        // Draw nodes
        for (const key in nodes) {
            const node = nodes[key];
            const isCollider = key === 'selection';

            dagCtx.fillStyle = isCollider ? colors.threshold : colors.node;
            dagCtx.beginPath();
            dagCtx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
            dagCtx.fill();

            dagCtx.fillStyle = colors.bg;
            dagCtx.font = '12px sans-serif';
            dagCtx.textAlign = 'center';
            dagCtx.textBaseline = 'middle';
            dagCtx.fillText(node.label, node.x, node.y);
        }

        // Add explanation text
        dagCtx.fillStyle = colors.fg;
        dagCtx.font = '11px sans-serif';
        dagCtx.textAlign = 'center';
        dagCtx.fillText('Among survivors, location and taste appear negatively correlated', width / 2, height - 15);
    }

    function drawArrow(ctx, x1, y1, x2, y2) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 10;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6),
            y2 - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6),
            y2 - headLength * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    }

    function drawScatterplot(canvas, ctx, dataPoints, title, showSelected) {
        const dims = setupCanvas(canvas, 1.5);
        const { width, height } = dims;
        const colors = getThemeColors();

        const padding = { top: 50, right: 20, bottom: 50, left: 60 };
        const plotW = width - padding.left - padding.right;
        const plotH = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, width, height);

        // Title
        ctx.fillStyle = colors.fg;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, width / 2, 20);

        if (dataPoints.length === 0) {
            ctx.fillStyle = colors.fg;
            ctx.font = '12px sans-serif';
            ctx.fillText('Press Step or Run to generate data', width / 2, height / 2);
            return;
        }

        // Scales
        const maxVal = 100;
        const scaleX = (x) => padding.left + (x / maxVal) * plotW;
        const scaleY = (y) => height - padding.bottom - (y / maxVal) * plotH;

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
            const val = (maxVal / 5) * i;
            const x = scaleX(val);
            ctx.fillText(val, x, height - padding.bottom + 5);
        }

        // Y-axis labels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= 5; i++) {
            const val = (maxVal / 5) * i;
            const y = scaleY(val);
            ctx.fillText(val, padding.left - 5, y);
        }

        // Axis titles
        ctx.fillStyle = colors.fg;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Location Quality', width / 2, height - 20);

        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Food Quality', 0, 0);
        ctx.restore();

        // Draw selection region shading if showing all data
        if (!showSelected) {
            // Shade the region where location + taste > threshold
            ctx.fillStyle = colors.selected;
            ctx.globalAlpha = 0.1;
            ctx.beginPath();

            // Line equation: location + taste = threshold
            // Find intersections with the 0-100 box
            let linePoints = [];

            // Check intersection with left edge (location = 0)
            if (threshold <= 100) {
                linePoints.push({ x: 0, y: threshold });
            }

            // Check intersection with top edge (taste = 100)
            const topX = threshold - 100;
            if (topX >= 0 && topX <= 100) {
                linePoints.push({ x: topX, y: 100 });
            }

            // Check intersection with right edge (location = 100)
            const rightY = threshold - 100;
            if (rightY >= 0 && rightY <= 100) {
                linePoints.push({ x: 100, y: rightY });
            }

            // Check intersection with bottom edge (taste = 0)
            if (threshold <= 100) {
                linePoints.push({ x: threshold, y: 0 });
            }

            // Draw the shaded region (upper-right area above the line)
            if (linePoints.length >= 2) {
                ctx.moveTo(scaleX(linePoints[0].x), scaleY(linePoints[0].y));

                // Go along the edge to the top-right corner
                if (linePoints[0].x === 0) {
                    ctx.lineTo(scaleX(0), scaleY(100));
                }
                ctx.lineTo(scaleX(100), scaleY(100));
                if (linePoints[linePoints.length - 1].y > 0) {
                    ctx.lineTo(scaleX(100), scaleY(linePoints[linePoints.length - 1].y));
                }

                // Back to start along the threshold line
                ctx.lineTo(scaleX(linePoints[linePoints.length - 1].x), scaleY(linePoints[linePoints.length - 1].y));
                ctx.closePath();
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // Draw threshold line
            if (linePoints.length >= 2) {
                ctx.strokeStyle = colors.threshold;
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(scaleX(linePoints[0].x), scaleY(linePoints[0].y));
                ctx.lineTo(scaleX(linePoints[linePoints.length - 1].x), scaleY(linePoints[linePoints.length - 1].y));
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // Calculate regression
        const regression = linearRegression(dataPoints);

        // Draw regression line if we have enough data
        if (dataPoints.length > 1 && !isNaN(regression.slope)) {
            ctx.strokeStyle = colors.trendLine;
            ctx.lineWidth = showSelected ? 3 : 2;
            ctx.globalAlpha = showSelected ? 1 : 0.5;
            ctx.beginPath();
            const y1 = regression.intercept;
            const y2 = regression.slope * 100 + regression.intercept;
            ctx.moveTo(scaleX(0), scaleY(y1));
            ctx.lineTo(scaleX(100), scaleY(y2));
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Calculate R²
            let ssRes = 0;
            let ssTot = 0;
            const meanY = dataPoints.reduce((sum, p) => sum + p.taste, 0) / dataPoints.length;

            for (const p of dataPoints) {
                const predictedY = regression.slope * p.location + regression.intercept;
                ssRes += Math.pow(p.taste - predictedY, 2);
                ssTot += Math.pow(p.taste - meanY, 2);
            }

            const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

            // Show statistics
            ctx.fillStyle = colors.fg;
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'left';
            const slopeText = regression.slope >= 0 ? '+' + regression.slope.toFixed(3) : regression.slope.toFixed(3);
            ctx.fillText(`Slope: ${slopeText}`, padding.left + 10, padding.top + 10);
            ctx.fillText(`R² = ${r2.toFixed(3)}`, padding.left + 10, padding.top + 25);
        }

        // Draw data points
        for (const d of dataPoints) {
            if (showSelected) {
                // Right plot: only selected points, visible
                ctx.fillStyle = colors.selected;
            } else {
                // Left plot: all points, uniform appearance
                ctx.fillStyle = colors.node;
            }
            const px = scaleX(d.location);
            const py = scaleY(d.taste);
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawScatterplots() {
        const selectedData = data.filter(d => d.selected);
        drawScatterplot(fullCanvas, fullCtx, data, 'All Restaurants', false);
        drawScatterplot(selectedCanvas, selectedCtx, selectedData, 'Surviving Restaurants Only', true);
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

    if (thresholdSlider) {
        thresholdSlider.addEventListener('input', () => {
            threshold = parseFloat(thresholdSlider.value);
            if (thresholdValue) thresholdValue.textContent = threshold;
            // Recalculate selection for existing data
            data.forEach(d => {
                d.selected = (d.location + d.taste) > threshold;
            });
            drawScatterplots();
        });
    }

    // Initialize - defer to ensure theme is loaded
    setTimeout(() => {
        reset();
    }, 0);

    listenForThemeChange(() => {
        drawDAG();
        drawScatterplots();
    });
}
