import { COLORS, STYLE } from "./constants.js";

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
    let isRunning = false;
    let animationId = null;

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

    function randn() {
        const u1 = Math.random();
        const u2 = Math.random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

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

        // Keep last 500 samples to prevent performance issues
        if (data.A.length > 500) {
            data.A = data.A.slice(-500);
            data.B = data.B.slice(-500);
            data.C = data.C.slice(-500);
        }

        drawDAG();
        drawScatter();
        updateCorrelations();
    }

    function reset() {
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (runBtn) runBtn.textContent = 'Run';
        data = { A: [], B: [], C: [] };
        drawDAG();
        drawScatter();
        updateCorrelations();
    }

    function correlation(x, y) {
        const n = x.length;
        if (n < 2) return 0;

        const meanX = x.reduce((a, b) => a + b, 0) / n;
        const meanY = y.reduce((a, b) => a + b, 0) / n;

        let num = 0, denomX = 0, denomY = 0;
        for (let i = 0; i < n; i++) {
            const dx = x[i] - meanX;
            const dy = y[i] - meanY;
            num += dx * dy;
            denomX += dx * dx;
            denomY += dy * dy;
        }

        const denom = Math.sqrt(denomX * denomY);
        return denom > 0 ? num / denom : 0;
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

    function getColors() {
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return {
            bg: isDark ? '#1d2021' : '#fbf1c7',
            fg: isDark ? '#ebdbb2' : '#3c3836',
            fg2: isDark ? '#a89984' : '#7c6f64',
            node: isDark ? '#458588' : '#076678',
            edge: isDark ? '#a89984' : '#7c6f64'
        };
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

        const ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        return { width: displayWidth, height: displayHeight };
    }

    function drawDAG() {
        const dims = setupCanvas(dagCanvas, 3); // 3:1 aspect ratio like berkson
        const { width, height } = dims;
        const colors = getColors();

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
        const colors = getColors();

        const labels = nodeLabels[structure] || nodeLabels['default'];
        const labelA = labels['A'];
        const labelC = labels['C'];
        drawScatterplot(scatterCtx, data.A, data.C, width, height, `${labelA} vs ${labelC}`, colors);
    }

    function drawScatterplot(ctx, xData, yData, width, height, label, colors) {
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
        ctx.fillText(label, width / 2, 20);

        if (xData.length === 0) {
            ctx.fillStyle = colors.fg2;
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Press Run', width / 2, height / 2);
            return;
        }

        // Find data ranges
        let xMin = Math.min(...xData);
        let xMax = Math.max(...xData);
        let yMin = Math.min(...yData);
        let yMax = Math.max(...yData);

        if (xMax === xMin) { xMin -= 1; xMax += 1; }
        if (yMax === yMin) { yMin -= 1; yMax += 1; }

        // Draw axes
        ctx.strokeStyle = colors.fg2;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // Draw points at 20% opacity
        const n = xData.length;
        ctx.fillStyle = 'rgba(74, 144, 226, 0.2)';
        for (let i = 0; i < n; i++) {
            const x = padding.left + ((xData[i] - xMin) / (xMax - xMin)) * plotW;
            const y = height - padding.bottom - ((yData[i] - yMin) / (yMax - yMin)) * plotH;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
        }

        // R² display
        const corr = correlation(xData, yData);
        const rSquared = corr * corr;
        ctx.fillStyle = colors.fg;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`R² = ${rSquared.toFixed(2)}`, width - padding.right - 10, padding.top + 10);
    }

    function runLoop() {
        if (!isRunning) return;
        generateSamples(10); // Add 10 samples per frame
        setTimeout(() => {
            animationId = requestAnimationFrame(runLoop);
        }, 100);
    }

    if (stepBtn) {
        stepBtn.addEventListener('click', () => {
            generateSamples(10); // Default to 10 samples per step
        });
    }

    if (runBtn) {
        runBtn.addEventListener('click', () => {
            isRunning = !isRunning;
            if (isRunning) {
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
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', reset);
    }

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
    drawDAG();
    drawScatter();
    updateCorrelations();
}
