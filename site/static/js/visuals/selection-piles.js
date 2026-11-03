import { getThemeColors, listenForThemeChange } from './utils.js';
import { SimulationController } from './simulation-controller.js';

export function initSelectionPiles({ id, model }) {
    const root = document.getElementById(id);
    if (!root) return;
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const summary = root.querySelector('[data-summary]');
    const probabilityColumn = model.probabilityColumn ?? 0;
    let piles, history, pair, flips, colors;

    function label(text, x, y, align = 'left') {
        ctx.fillStyle = colors.fg;
        ctx.textAlign = align;
        ctx.fillText(text, x, y);
    }
    function drawHistory(panel, x, y, width) {
        const left = x + 42;
        const right = x + width - 62;
        const chartColor = probabilityColumn === 1 ? colors.threshold : colors.node;
        const top = y + 324;
        const bottom = y + 414;
        const maxTrial = Math.max(1, flips);
        const scaleX = trial => left + trial / maxTrial * (right - left);
        const scaleY = probability => bottom - probability * (bottom - top);
        ctx.save();
        ctx.font = '11px sans-serif';
        const kept = piles[panel][0].length + piles[panel][1].length;
        const fraction = `${piles[panel][probabilityColumn].length}/${kept} ${model.denominatorLabel || 'kept'}`;
        label(`${model.columnLabels[probabilityColumn]} · ${fraction}`, x + 10, y + 300);
        for (const probability of [0, 0.5, 1]) {
            const py = scaleY(probability);
            ctx.strokeStyle = colors.grid;
            ctx.beginPath();
            ctx.moveTo(left, py);
            ctx.lineTo(probability === 0.5 ? left + 3 : right, py);
            ctx.stroke();
            label(`${probability * 100}%`, left - 6, py, 'right');
        }
        const ticks = [0, maxTrial];
        for (const trial of ticks) label(trial, scaleX(trial), bottom + 14, 'center');
        label('Trials', (left + right) / 2, bottom + 34, 'center');
        ctx.strokeStyle = chartColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        let started = false;
        history[panel].forEach((probability, index) => {
            // Until the first accepted trial, conditional probability is undefined.
            if (probability === null) return;
            const px = scaleX(index + 1);
            const py = scaleY(probability);
            if (!started) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
            started = true;
        });
        ctx.stroke();
        const latest = history[panel].at(-1);
        if (latest !== undefined && latest !== null) {
            ctx.strokeStyle = chartColor;
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 4]);
            ctx.beginPath();
            ctx.moveTo(left, scaleY(latest));
            ctx.lineTo(right, scaleY(latest));
            ctx.stroke();
            ctx.setLineDash([]);
            label(`${(latest * 100).toFixed(1)}%`, right + 8, scaleY(latest));
            ctx.fillStyle = chartColor;
            ctx.beginPath();
            ctx.arc(scaleX(flips), scaleY(latest), 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            label('Waiting for a counted trial', (left + right) / 2, (top + bottom) / 2, 'center');
        }
        ctx.restore();
    }
    function draw() {
        const width = root.clientWidth;
        const singlePanel = model.titles.length === 1;
        const stacked = width < 680;
        const height = stacked && !singlePanel ? 1070 : 590;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        colors = getThemeColors();
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, width, height);
        ctx.font = '12px sans-serif';
        ctx.textBaseline = 'middle';
        label(`${model.itemName} ${flips || '—'}`, width / 2, 20, 'center');
        const sourceOffset = i => (i - (model.sourceLabels.length - 1) / 2) * 90;
        model.sourceLabels.forEach((sourceLabel, i) => {
            const x = width / 2 + sourceOffset(i);
            ctx.beginPath();
            if (model.sourceShape === 'door') ctx.rect(x - 28, 34, 56, 48);
            else if (model.sourceShape === 'die') ctx.rect(x - 22, 36, 44, 44);
            else ctx.arc(x, 58, 22, 0, Math.PI * 2);
            ctx.fillStyle = colors.bg;
            ctx.fill();
            ctx.strokeStyle = colors.fg2;
            ctx.stroke();
            ctx.font = `bold ${model.sourceFontSize || 20}px sans-serif`;
            if (pair && model.sourceShape === 'die') {
                const value = Number(model.sourceText(pair, i));
                const pips = [];
                if (value % 2 === 1) pips.push([0, 0]);
                if (value >= 2) pips.push([-11, -11], [11, 11]);
                if (value >= 4) pips.push([11, -11], [-11, 11]);
                if (value === 6) pips.push([-11, 0], [11, 0]);
                ctx.fillStyle = colors.fg;
                for (const [dx, dy] of pips) {
                    ctx.beginPath();
                    ctx.arc(x + dx, 58 + dy, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else label(pair ? model.sourceText(pair, i) : '?', x, 58, 'center');
            ctx.font = '12px sans-serif';
            label(sourceLabel, x, 94, 'center');
        });
        // Join the two observations into one result before routing it to both filters.
        if (pair) {
            ctx.strokeStyle = colors.fg2;
            ctx.beginPath();
            ctx.moveTo(width / 2 + sourceOffset(0), 81);
            ctx.lineTo(width / 2 + sourceOffset(0), 85);
            ctx.lineTo(width / 2 + sourceOffset(model.sourceLabels.length - 1), 85);
            ctx.lineTo(width / 2 + sourceOffset(model.sourceLabels.length - 1), 81);
            ctx.moveTo(width / 2, 85);
            ctx.lineTo(width / 2, 108);
            ctx.stroke();
        }
        // Every column uses the same vertical scale, including discarded pairs.
        const maxCount = Math.max(8, ...piles.flatMap(pile => pile.map(column => column.length)));
        const unit = 160 / maxCount;
        const accepted = pair ? model.selection(pair) : model.titles.map(() => false);
        piles.forEach((pile, i) => {
            const panelWidth = stacked || singlePanel ? width - 24 : (width - 36) / 2;
            const x = stacked || singlePanel ? 12 : 12 + i * (panelWidth + 12);
            const y = 118 + (stacked ? i * 480 : 0);
            const base = y + 244;
            const columnWidth = (panelWidth - 20) / model.columnLabels.length;
            const barWidth = Math.min(58, columnWidth - 12);
            ctx.font = 'bold 12px sans-serif';
            label(model.titles[i], x, y + 12);
            ctx.font = '12px sans-serif';
            const destination = pair ? (!accepted[i] ? 2 : model.isTarget(pair) ? 0 : 1) : -1;
            // A host's reveal differs by panel; other models already show the
            // complete current trial above, so repeating it adds no information.
            if (pair && model.panelDetail) label(model.panelDetail(pair, i), x, y + 36);
            pile.forEach((column, j) => {
                const center = x + 10 + (j + 0.5) * columnWidth;
                const left = center - barWidth / 2;
                const color = [colors.node, colors.threshold, colors.rejected][j];
                const barHeight = column.length * unit;
                ctx.fillStyle = color;
                ctx.fillRect(left, base - barHeight, barWidth, barHeight);
                // Individual tiles stay readable early on; tall stacks become bars.
                if (unit >= 12) column.forEach((value, k) => {
                    const top = base - (k + 1) * unit;
                    ctx.strokeStyle = colors.bg;
                    ctx.beginPath();
                    ctx.moveTo(left, top);
                    ctx.lineTo(left + barWidth, top);
                    ctx.stroke();
                    ctx.fillStyle = j === 2 ? colors.fg : colors.bg_h;
                    ctx.textAlign = 'center';
                    ctx.fillText(model.tileText(value, i), center, top + unit / 2);
                });
                if (j === destination) {
                    // Route through the outside gutter and above the plot so the
                    // connector never runs through headings or another stack.
                    const rail = i === 0 ? 6 : width - 6;
                    const approach = left - 9;
                    const targetY = base - barHeight + Math.min(unit, 24) / 2;
                    ctx.save();
                    ctx.strokeStyle = j === 2 ? colors.fg2 : color;
                    ctx.fillStyle = ctx.strokeStyle;
                    ctx.lineWidth = 2;
                    ctx.lineJoin = 'round';
                    ctx.setLineDash(j === 2 ? [5, 4] : []);
                    ctx.beginPath();
                    ctx.moveTo(width / 2, 108);
                    ctx.lineTo(rail, 108);
                    ctx.lineTo(rail, y + 60);
                    ctx.lineTo(approach, y + 60);
                    ctx.lineTo(approach, targetY);
                    ctx.lineTo(left - 2, targetY);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(left - 2, targetY);
                    ctx.lineTo(left - 8, targetY - 4);
                    ctx.lineTo(left - 8, targetY + 4);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                    ctx.strokeStyle = colors.fg;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(left - 2, base - barHeight - 2, barWidth + 4, Math.min(unit, barHeight) + 4);
                    ctx.lineWidth = 1;
                }
                label(column.length, center, base - barHeight - 12, 'center');
                label(model.columnLabels[j], center, base + 18, 'center');
            });
            drawHistory(i, x, y, panelWidth);
        });
    }
    function step() {
        pair = model.sample();
        flips++;
        const decisions = model.selection(pair).map((accepted, i) => {
            const column = !accepted ? 2 : model.isTarget(pair) ? 0 : 1;
            piles[i][column].push(pair);
            const kept = piles[i][0].length + piles[i][1].length;
            history[i].push(kept ? piles[i][probabilityColumn].length / kept : null);
            return `${model.titles[i]}: added to ${model.columnLabels[column].toLowerCase()}; ${piles[i].map((values, j) => `${values.length} ${model.columnLabels[j].toLowerCase()}`).join(', ')}.`;
        });
        summary.textContent = `${model.itemName} ${flips}: ${model.describe(pair)}. ${decisions.join(' ')}`;
        canvas.setAttribute('aria-label', summary.textContent);
        draw();
    }
    function reset() {
        pair = null;
        flips = 0;
        piles = model.titles.map(() => model.columnLabels.map(() => []));
        history = model.titles.map(() => []);
        summary.textContent = model.emptyText;
        canvas.setAttribute('aria-label', summary.textContent);
        draw();
    }
    const controller = new SimulationController({
        stepBtn: root.querySelector('[data-step]'),
        runBtn: root.querySelector('[data-run]'),
        resetBtn: root.querySelector('[data-reset]'),
        speed: 100,
        onStep: step,
        onReset: reset
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) controller.stop();
    });
    new ResizeObserver(draw).observe(root);
    listenForThemeChange(draw);
    reset();
}
