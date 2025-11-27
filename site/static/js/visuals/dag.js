import { COLORS, STYLE } from "./constants.js";

export function initDAG(ids) {
    const canvas = document.getElementById(ids.canvasId);
    const correlationDiv = document.getElementById(ids.correlationId);
    const weightsDiv = document.getElementById(ids.weightsId);
    const stepBtn = document.getElementById(ids.stepId);
    const runBtn = document.getElementById(ids.runId);
    const resetBtn = document.getElementById(ids.resetId);
    const stepCountName = ids.stepCountName; // Unused now
    const sampleCountEl = document.getElementById(ids.sampleCountId); // Unused now

    // Structure is now passed as a parameter
    const structure = ids.structure || 'chain';

    const ctx = canvas.getContext('2d');
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

        draw();
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
        draw();
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

    let canvasLogicalWidth = 0;
    let canvasLogicalHeight = 0;

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

    function draw() {
        const w = canvasLogicalWidth;
        const h = canvasLogicalHeight;
        const colors = getColors();
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, w, h);

        // Node positions - use same aspect ratio as berkson (3:1)
        const nodeRadius = 30;
        const centerX = w / 2;
        const spacing = 150;
        const dagHeight = Math.round(w / 3); // Same aspect ratio as berkson

        const nodes = {
            A: { x: centerX - spacing / 2, y: dagHeight * 0.65 },
            B: { x: centerX, y: dagHeight * 0.35 },
            C: { x: centerX + spacing / 2, y: dagHeight * 0.65 }
        };

        const edges = structures[structure].edges;

        // Draw edges with arrows
        ctx.strokeStyle = colors.edge;
        ctx.fillStyle = colors.edge;
        ctx.lineWidth = 2;

        for (const [from, to] of edges) {
            const start = nodes[from];
            const end = nodes[to];

            const angle = Math.atan2(end.y - start.y, end.x - start.x);

            const startX = start.x + nodeRadius * Math.cos(angle);
            const startY = start.y + nodeRadius * Math.sin(angle);
            const endX = end.x - nodeRadius * Math.cos(angle);
            const endY = end.y - nodeRadius * Math.sin(angle);

            // Draw line
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Draw arrowhead
            const headLength = 10;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6),
                       endY - headLength * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6),
                       endY - headLength * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();
        }

        // Draw nodes
        const labels = nodeLabels[structure] || nodeLabels['default'];
        for (const [name, pos] of Object.entries(nodes)) {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
            ctx.fillStyle = colors.node;
            ctx.fill();

            ctx.fillStyle = colors.bg;
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const label = labels[name] || name;
            ctx.fillText(label, pos.x, pos.y);
        }

        // Add explanation text
        ctx.fillStyle = colors.fg;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Ice cream and crime appear correlated, but summer causes both', w / 2, dagHeight + 10);

        // Draw single scatterplot - Ice Cream vs Crime
        const maxPlotSize = 240; // Larger since it's just one plot
        const plotSize = Math.min(maxPlotSize, Math.floor(w * 0.5));
        const plotY = dagHeight + 30 + plotSize / 2; // Start after DAG and explanation text

        const labelA = labels['A'];
        const labelC = labels['C'];
        drawScatterplot(data.A, data.C, w / 2, plotY, plotSize, plotSize, `${labelA} vs ${labelC}`);
    }

    function drawScatterplot(xData, yData, centerX, centerY, width, height, label) {
        const padding = 10;
        const plotW = width - 2 * padding;
        const plotH = height - 2 * padding;

        // Draw background
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(centerX - width / 2, centerY - height / 2, width, height);

        ctx.font = STYLE.font.medium;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const labelColor = isDark ? '#fff' : '#333';

        if (xData.length === 0) {
            ctx.fillStyle = '#999';
            ctx.textBaseline = 'middle';
            ctx.fillText('Press Run', centerX, centerY);
            // Label underneath
            ctx.fillStyle = labelColor;
            ctx.font = 'bold 13px sans-serif';
            ctx.textBaseline = 'top';
            ctx.fillText(label, centerX, centerY + height / 2 + 8);
            return;
        }

        // Find data ranges
        let xMin = Math.min(...xData);
        let xMax = Math.max(...xData);
        let yMin = Math.min(...yData);
        let yMax = Math.max(...yData);

        if (xMax === xMin) { xMin -= 1; xMax += 1; }
        if (yMax === yMin) { yMin -= 1; yMax += 1; }

        // Draw points at 20% opacity
        const n = xData.length;
        ctx.fillStyle = 'rgba(74, 144, 226, 0.2)';
        for (let i = 0; i < n; i++) {
            const x = centerX - width / 2 + padding + ((xData[i] - xMin) / (xMax - xMin)) * plotW;
            const y = centerY + height / 2 - padding - ((yData[i] - yMin) / (yMax - yMin)) * plotH;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Label and R² underneath
        const corr = correlation(xData, yData);
        const rSquared = corr * corr;
        ctx.fillStyle = labelColor;
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(label, centerX, centerY + height / 2 + 8);
        ctx.font = '12px sans-serif';
        ctx.fillText(`R² = ${rSquared.toFixed(2)}`, centerX, centerY + height / 2 + 24);
    }

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvasLogicalWidth = rect.width;

        // Calculate height to fit: DAG (width/3) + explanation text (30) + single plot + labels (50)
        const dagHeight = Math.round(rect.width / 3);
        const maxPlotSize = 240;
        const plotSize = Math.min(maxPlotSize, Math.floor(rect.width * 0.5));
        canvasLogicalHeight = dagHeight + 30 + plotSize + 50;

        canvas.style.height = `${canvasLogicalHeight}px`;
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(canvasLogicalHeight * dpr);
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
        draw();
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
        resizeTimeout = setTimeout(resizeCanvas, 100);
    });

    // Initialize
    buildWeightControls();
    resizeCanvas();
    updateCorrelations();
}
