/**
 * Berkson's Paradox Visualization
 * Shows inverse correlation due to selection bias
 */

import { getThemeColors, listenForThemeChange } from "./utils.js";
import { linearRegression } from "./stats.js";
import { ScatterplotRenderer } from "./scatterplot-renderer.js";
import { SimulationController } from "./simulation-controller.js";

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

    function reset() {
        if (controller) controller.stop();
        data = [];
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

        drawScatterplots();
    }

    const controller = new SimulationController({
        stepBtn,
        runBtn,
        resetBtn,
        speed: 200,
        onStep: () => {
            step();
            if (data.length >= 200) {
                controller.stop();
            }
        },
        onReset: reset
    });


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
        const isMobile = window.innerWidth < 600;
        const aspectRatio = isMobile ? 2 : 3;
        const dims = setupCanvas(dagCanvas, aspectRatio);
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
        const xData = dataPoints.map(p => p.location);
        const yData = dataPoints.map(p => p.taste);

        // Custom background drawing for selection region
        const drawSelectionRegion = (ctx, { xScale, yScale, colors }) => {
            if (showSelected) return;

            ctx.fillStyle = colors.selected;
            ctx.globalAlpha = 0.1;
            ctx.beginPath();

            // Line equation: location + taste = threshold
            // y = threshold - x
            const points = [];

            // Intersections with box (0,0) to (100,100)
            // Left (x=0): y = threshold
            if (threshold <= 100) points.push({ x: 0, y: threshold });
            // Top (y=100): x = threshold - 100
            if (threshold >= 100 && threshold <= 200) points.push({ x: threshold - 100, y: 100 });
            // Right (x=100): y = threshold - 100
            if (threshold >= 100 && threshold <= 200) points.push({ x: 100, y: threshold - 100 });
            // Bottom (y=0): x = threshold
            if (threshold <= 100) points.push({ x: threshold, y: 0 });

            if (points.length >= 2) {
                ctx.moveTo(xScale(points[0].x), yScale(points[0].y));
                // We want the upper right region
                // If we started at x=0, we go to (0,100) then (100,100)
                if (points[0].x === 0) ctx.lineTo(xScale(0), yScale(100));
                ctx.lineTo(xScale(100), yScale(100));
                if (points[points.length - 1].y > 0) ctx.lineTo(xScale(100), yScale(points[points.length - 1].y));
                ctx.lineTo(xScale(points[points.length - 1].x), yScale(points[points.length - 1].y));
                ctx.closePath();
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // Threshold line
            if (points.length >= 2) {
                ctx.strokeStyle = colors.threshold;
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(xScale(points[0].x), yScale(points[0].y));
                ctx.lineTo(xScale(points[points.length - 1].x), yScale(points[points.length - 1].y));
                ctx.stroke();
                ctx.setLineDash([]);
            }
        };

        const drawStats = (ctx, { width, colors }) => {
            if (dataPoints.length <= 1) return;

            const regression = linearRegression(xData, yData);
            if (isNaN(regression.slope)) return;

            // Calculate R² manually since we want to display it differently
            // Actually stats.js linearRegression returns r2
            const r2 = regression.r2;

            ctx.fillStyle = colors.fg;
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'left';
            const slopeText = regression.slope >= 0 ? '+' + regression.slope.toFixed(3) : regression.slope.toFixed(3);
            // Hardcoded padding values from ScatterplotRenderer default
            const padding = { top: 30, left: 60 };
            ctx.fillText(`Slope: ${slopeText}`, padding.left + 10, padding.top + 10);
            ctx.fillText(`R² = ${r2.toFixed(3)}`, padding.left + 10, padding.top + 25);
        };

        const renderer = new ScatterplotRenderer(ctx, {
            title,
            xLabel: 'Location Quality',
            yLabel: 'Food Quality',
            pointColor: showSelected ? getThemeColors().selected : getThemeColors().node,
            showRegression: true,
            showR2: false, // We draw it manually
            onDrawBackground: drawSelectionRegion,
            onDrawForeground: drawStats
        });

        const dims = setupCanvas(canvas, 1.5);
        renderer.draw(xData, yData, dims.width, dims.height);
    }

    function drawScatterplots() {
        const selectedData = data.filter(d => d.selected);
        drawScatterplot(fullCanvas, fullCtx, data, 'All Restaurants', false);
        drawScatterplot(selectedCanvas, selectedCtx, selectedData, 'Surviving Restaurants Only', true);
    }

    // Event listeners
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

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            drawDAG();
            drawScatterplots();
        }, 100);
    });
}
