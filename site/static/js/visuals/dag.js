import { COLORS, STYLE } from "./constants.js";
import { getThemeColors, listenForThemeChange } from "./utils.js";
import { randn, correlation } from "./stats.js";
import { ScatterplotRenderer } from "./scatterplot-renderer.js";
import { SimulationController } from "./simulation-controller.js";

export function initDAG(ids) {
    const dagCanvas = document.getElementById(ids.dagCanvasId);
    const scatterCanvas = document.getElementById(ids.scatterCanvasId);
    const correlationDiv = document.getElementById(ids.correlationId);
    const weightsDiv = document.getElementById(ids.weightsId);
    const stepBtn = document.getElementById(ids.stepId);
    const runBtn = document.getElementById(ids.runId);
    const resetBtn = document.getElementById(ids.resetId);

    if (!dagCanvas || !scatterCanvas) return;

    // Structure is now passed as a parameter
    const structure = ids.structure || 'chain';

    const dagCtx = dagCanvas.getContext('2d');
    const scatterCtx = scatterCanvas.getContext('2d');
    let data = { A: [], B: [], C: [] };
    let edgeWeights = {};

    const structures = {
        'chain': { name: 'Chain: A → B → C', edges: [['A', 'B'], ['B', 'C']] },
        'fork': { name: 'Fork: A → B, A → C', edges: [['A', 'B'], ['A', 'C']] },
        'collider': { name: 'Collider: A → B ← C', edges: [['A', 'B'], ['C', 'B']] },
        'independent': { name: 'Independent: A, B, C', edges: [] },
        'confounded': { name: 'Confounded: A ← B → C', edges: [['B', 'A'], ['B', 'C']] }
    };

    // Node labels per structure
    const nodeLabels = {
        'confounded': { A: 'Ice Cream', B: 'Summer', C: 'Crime' },
        'default': { A: 'A', B: 'B', C: 'C' }
    };



    function generateSamples(count) {
        const edges = structures[structure].edges;

        for (let s = 0; s < count; s++) {
            const noise = { A: randn(), B: randn(), C: randn() };
            const influences = { A: [], B: [], C: [] };
            for (const [from, to] of edges) {
                const weight = edgeWeights[`${from}-${to}`] ?? 0.7;
                influences[to].push({ from, weight });
            }

            const values = { A: noise.A, B: noise.B, C: noise.C };

            for (let iter = 0; iter < 3; iter++) {
                for (const [target, sources] of Object.entries(influences)) {
                    if (sources.length > 0) {
                        let caused = 0;
                        for (const { from, weight } of sources) {
                            caused += weight * values[from];
                        }
                        const noiseWeight = Math.max(0, 1 - sources.reduce((sum, s) => sum + Math.abs(s.weight), 0));
                        values[target] = noiseWeight * noise[target] + caused;
                    }
                }
            }

            data.A.push(values.A);
            data.B.push(values.B);
            data.C.push(values.C);
        }

        drawDAG();
        drawScatter();
        updateCorrelations();
    }

    function reset() {
        if (controller) controller.stop();
        data = { A: [], B: [], C: [] };
        drawDAG();
        drawScatter();
        updateCorrelations();
    }



    function updateCorrelations() {
        if (!correlationDiv) return;
        correlationDiv.innerHTML = '';
    }

    function buildWeightControls() {
        if (!weightsDiv) return;

        const edges = structures[structure].edges;
        const labels = nodeLabels[structure] || nodeLabels['default'];

        if (edges.length === 0) {
            weightsDiv.innerHTML = '<em>No causal relationships</em>';
            return;
        }

        let html = '<div class="dag-weight-sliders">';
        for (const [from, to] of edges) {
            const key = `${from}-${to}`;
            const currentWeight = edgeWeights[key] ?? 0.7;
            const labelFrom = labels[from] || from;
            const labelTo = labels[to] || to;
            html += `
                <div class="dag-weight-control">
                    <label>${labelFrom} → ${labelTo}:</label>
                    <input type="range" min="-1" max="1" step="0.1" value="${currentWeight}"
                           data-edge="${key}" class="dag-weight-slider">
                    <span class="dag-weight-value">${currentWeight.toFixed(1)}</span>
                </div>
            `;
        }
        html += '</div>';
        weightsDiv.innerHTML = html;

        weightsDiv.querySelectorAll('.dag-weight-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const key = e.target.dataset.edge;
                const val = parseFloat(e.target.value);
                edgeWeights[key] = val;
                e.target.nextElementSibling.textContent = val.toFixed(1);
                if (data.A.length > 0) {
                    // Re-generate data with new weights if we have data
                    // Or just clear? Let's clear to avoid confusion
                    reset();
                }
            });
        });
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
        const dims = setupCanvas(dagCanvas, 3); // 3:1 aspect ratio like berkson
        const { width, height } = dims;
        const colors = getThemeColors();

        dagCtx.clearRect(0, 0, width, height);
        dagCtx.fillStyle = colors.bg;
        dagCtx.fillRect(0, 0, width, height);

        // Node positions
        const nodeRadius = 30;
        const centerX = width / 2;
        const spacing = 150;

        const nodes = {
            A: { x: centerX - spacing / 2, y: height * 0.65 },
            B: { x: centerX, y: height * 0.35 },
            C: { x: centerX + spacing / 2, y: height * 0.65 }
        };

        const edges = structures[structure].edges;

        // Draw edges with arrows
        dagCtx.strokeStyle = colors.edge;
        dagCtx.fillStyle = colors.edge;
        dagCtx.lineWidth = 2;

        for (const [from, to] of edges) {
            const start = nodes[from];
            const end = nodes[to];

            const angle = Math.atan2(end.y - start.y, end.x - start.x);

            const startX = start.x + nodeRadius * Math.cos(angle);
            const startY = start.y + nodeRadius * Math.sin(angle);
            const endX = end.x - nodeRadius * Math.cos(angle);
            const endY = end.y - nodeRadius * Math.sin(angle);

            // Draw line
            dagCtx.beginPath();
            dagCtx.moveTo(startX, startY);
            dagCtx.lineTo(endX, endY);
            dagCtx.stroke();

            // Draw arrowhead
            const headLength = 10;
            dagCtx.beginPath();
            dagCtx.moveTo(endX, endY);
            dagCtx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6),
                endY - headLength * Math.sin(angle - Math.PI / 6));
            dagCtx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6),
                endY - headLength * Math.sin(angle + Math.PI / 6));
            dagCtx.closePath();
            dagCtx.fill();
        }

        // Draw nodes
        const labels = nodeLabels[structure] || nodeLabels['default'];
        for (const [name, pos] of Object.entries(nodes)) {
            dagCtx.beginPath();
            dagCtx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
            dagCtx.fillStyle = colors.node;
            dagCtx.fill();

            dagCtx.fillStyle = colors.bg;
            dagCtx.font = '12px sans-serif';
            dagCtx.textAlign = 'center';
            dagCtx.textBaseline = 'middle';
            const label = labels[name] || name;
            dagCtx.fillText(label, pos.x, pos.y);
        }

        // Add explanation text
        dagCtx.fillStyle = colors.fg;
        dagCtx.font = '11px sans-serif';
        dagCtx.textAlign = 'center';
        dagCtx.fillText('Ice cream and crime appear correlated, but summer causes both', width / 2, height - 15);
    }

    function drawScatter() {
        const dims = setupCanvas(scatterCanvas, 1.5); // 1.5:1 aspect ratio like berkson scatterplots
        const { width, height } = dims;
        const colors = getThemeColors();

        const labels = nodeLabels[structure] || nodeLabels['default'];
        const labelA = labels['A'];
        const labelC = labels['C'];
        drawScatterplot(scatterCtx, data.A, data.C, width, height, `${labelA} vs ${labelC}`, colors);
    }

    function drawScatterplot(ctx, xData, yData, width, height, label, colors) {
        const labels = nodeLabels[structure] || nodeLabels['default'];
        const xLabel = labels['A'] || 'A';
        const yLabel = labels['C'] || 'C';

        const renderer = new ScatterplotRenderer(ctx, {
            title: label,
            xLabel: xLabel,
            yLabel: yLabel,
            showRegression: true,
            showR2: true
        });

        renderer.draw(xData, yData, width, height);
    }

    const controller = new SimulationController({
        stepBtn,
        runBtn,
        resetBtn,
        speed: 100,
        onStep: () => {
            generateSamples(10);
        },
        onReset: reset,
        onStop: () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
    });

    // Override generateSamples to stop controller if limit reached
    const originalGenerateSamples = generateSamples;
    generateSamples = function (count) {
        originalGenerateSamples(count);
        if (data.A.length >= 500) {
            controller.stop();
        }
    };

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            drawDAG();
            drawScatter();
        }, 100);
    });

    // Initialize
    buildWeightControls();

    // Defer initial draw to ensure theme is loaded
    setTimeout(() => {
        drawDAG();
        drawScatter();
        updateCorrelations();
    }, 0);

    listenForThemeChange(() => {
        drawDAG();
        drawScatter();
    });
}
