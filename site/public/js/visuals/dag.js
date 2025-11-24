import { COLORS, STYLE } from "./constants.js";

export function initDAG(ids) {
    const canvas = document.getElementById(ids.canvasId);
    const correlationDiv = document.getElementById(ids.correlationId);
    const weightsDiv = document.getElementById(ids.weightsId);
    const stepBtn = document.getElementById(ids.stepId);
    const runBtn = document.getElementById(ids.runId);
    const resetBtn = document.getElementById(ids.resetId);
    const stepCountName = ids.stepCountName;
    const sampleCountEl = document.getElementById(ids.sampleCountId);

    // Structure is now passed as a parameter
    const structure = ids.structure || 'chain';

    const ctx = canvas.getContext('2d');
    let data = { A: [], B: [], C: [] };
    let edgeWeights = {};
    let isRunning = false;

    const structures = {
        'chain': { name: 'Chain: A → B → C', edges: [['A', 'B'], ['B', 'C']] },
        'fork': { name: 'Fork: A → B, A → C', edges: [['A', 'B'], ['A', 'C']] },
        'collider': { name: 'Collider: A → B ← C', edges: [['A', 'B'], ['C', 'B']] },
        'independent': { name: 'Independent: A, B, C', edges: [] },
        'confounded': { name: 'Confounded: A ← B → C', edges: [['B', 'A'], ['B', 'C']] }
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

        updateSampleCount();
        draw();
        updateCorrelations();
    }

    function reset() {
        isRunning = false;
        data = { A: [], B: [], C: [] };
        updateSampleCount();
        draw();
        updateCorrelations();
    }

    function updateSampleCount() {
        if (sampleCountEl) {
            sampleCountEl.textContent = `n = ${data.A.length}`;
        }
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

        if (data.A.length < 2) {
            correlationDiv.innerHTML = '';
            return;
        }

        const corrAB = correlation(data.A, data.B);
        const corrBC = correlation(data.B, data.C);
        const corrAC = correlation(data.A, data.C);

        correlationDiv.innerHTML = `
            <strong>Correlations:</strong>
            A↔B: ${corrAB.toFixed(2)},
            B↔C: ${corrBC.toFixed(2)},
            A↔C: ${corrAC.toFixed(2)}
        `;
    }

    function buildWeightControls() {
        if (!weightsDiv) return;

        const edges = structures[structure].edges;

        if (edges.length === 0) {
            weightsDiv.innerHTML = '<em>No causal relationships</em>';
            return;
        }

        let html = '<div class="dag-weight-sliders">';
        for (const [from, to] of edges) {
            const key = `${from}-${to}`;
            const currentWeight = edgeWeights[key] ?? 0.7;
            html += `
                <div class="dag-weight-control">
                    <label>${from} → ${to}:</label>
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
                    const count = data.A.length;
                    reset();
                    generateSamples(count);
                }
            });
        });
    }

    let canvasLogicalWidth = 0;
    let canvasLogicalHeight = 0;

    function draw() {
        const w = canvasLogicalWidth;
        const h = canvasLogicalHeight;
        ctx.clearRect(0, 0, w, h);

        // Node positions
        const nodes = {
            A: { x: w * 0.3, y: 50 },
            B: { x: w * 0.5, y: 110 },
            C: { x: w * 0.7, y: 50 }
        };

        const edges = structures[structure].edges;

        // Draw edges with weight-based thickness
        for (const [from, to] of edges) {
            const start = nodes[from];
            const end = nodes[to];
            const weight = edgeWeights[`${from}-${to}`] ?? 0.7;

            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const nodeRadius = STYLE.nodeRadius;

            const startX = start.x + nodeRadius * Math.cos(angle);
            const startY = start.y + nodeRadius * Math.sin(angle);
            const endX = end.x - nodeRadius * Math.cos(angle);
            const endY = end.y - nodeRadius * Math.sin(angle);

            const isNegative = weight < 0;
            ctx.strokeStyle = isNegative ? '#c44' : '#666';
            ctx.fillStyle = isNegative ? '#c44' : '#666';
            ctx.lineWidth = 1 + Math.abs(weight) * 3;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - 10 * Math.cos(angle - Math.PI / 6), endY - 10 * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(endX - 10 * Math.cos(angle + Math.PI / 6), endY - 10 * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();
        }

        // Draw nodes
        for (const [name, pos] of Object.entries(nodes)) {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, STYLE.nodeRadius, 0, 2 * Math.PI);
            ctx.fillStyle = COLORS.dag.node;
            ctx.fill();
            ctx.strokeStyle = COLORS.dag.nodeBorder;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = `bold ${STYLE.font.large}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(name, pos.x, pos.y);
        }

        // Draw scatterplots - size based on available width, leave room for labels
        const maxPlotSize = STYLE.plotSize;
        const plotSize = Math.min(maxPlotSize, Math.floor((w - 40) / 3.5));
        const labelSpace = 30; // Space for labels below plots
        const plotY = 140 + plotSize / 2;
        const spacing = (w - 3 * plotSize) / 4;

        drawScatterplot(data.A, data.B, spacing + plotSize / 2, plotY, plotSize, plotSize, 'A vs B');
        drawScatterplot(data.B, data.C, spacing * 2 + plotSize * 1.5, plotY, plotSize, plotSize, 'B vs C');
        drawScatterplot(data.A, data.C, spacing * 3 + plotSize * 2.5, plotY, plotSize, plotSize, 'A vs C');
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
            ctx.fillText('No data', centerX, centerY);
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

    function getStepCount() {
        const radio = stepCountName ? document.querySelector(`input[name="${stepCountName}"]:checked`) : null;
        return radio ? parseInt(radio.value, 10) : 10;
    }

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvasLogicalWidth = rect.width;

        // Calculate height to fit: nodes (140) + plot size + labels (70)
        const maxPlotSize = STYLE.plotSize;
        const plotSize = Math.min(maxPlotSize, Math.floor((rect.width - 40) / 3.5));
        canvasLogicalHeight = 140 + plotSize + 70;

        canvas.style.height = `${canvasLogicalHeight}px`;
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(canvasLogicalHeight * dpr);
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
        draw();
    }

    if (stepBtn) {
        stepBtn.addEventListener('click', () => {
            generateSamples(getStepCount());
        });
    }

    if (runBtn) {
        runBtn.addEventListener('click', () => {
            if (isRunning) return;
            isRunning = true;
            const startTime = Date.now();

            const loop = () => {
                if (!isRunning) return;
                if (Date.now() - startTime > 5000) {
                    isRunning = false;
                    return;
                }
                generateSamples(getStepCount());
                requestAnimationFrame(loop);
            };
            loop();
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
