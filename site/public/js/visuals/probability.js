import { getThemeColors, listenForThemeChange } from './utils.js';
import { SimulationController } from './simulation-controller.js';
import { birthdayProbabilities, childFamilies, montyGame } from './probability-models.js';

const percent = value => `${(value * 100).toFixed(2)}%`;

export function initProbability({ id, kind, condition }) {
    const root = document.getElementById(id);
    if (!root) return;
    if (kind === 'children' && !condition) {
        root.querySelectorAll('[data-condition]').forEach(panel => {
            initProbability({ id: panel.id, kind, condition: panel.dataset.condition });
        });
        return;
    }
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const input = root.querySelector('[data-input]');
    const summary = root.querySelector('[data-summary]');
    let totals = freshTotals();
    let width, height, colors;

    function freshTotals() {
        return [true, false].map(knowing => ({ knowing, games: 0, kept: 0, stay: 0, switch: 0 }));
    }
    function text(value, x, y, align = 'left') {
        ctx.fillStyle = colors.fg;
        ctx.textAlign = align;
        ctx.fillText(value, x, y);
    }
    function line(x1, y1, x2, y2, color, dashed = false) {
        ctx.strokeStyle = color;
        ctx.setLineDash(dashed ? [5, 4] : []);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    function birthdays() {
        const n = Number(input.value);
        root.querySelector('[data-value]').textContent = n;
        const x = n => 42 + (n - 1) / 365 * (width - 60);
        const y = p => height - 42 - p * (height - 66);
        for (const p of [0, 0.25, 0.5, 0.75, 1]) {
            line(42, y(p), width - 18, y(p), colors.grid);
            text(`${p * 100}%`, 36, y(p), 'right');
        }
        for (const n of [1, 100, 200, 300, 366]) text(n, x(n), height - 26, 'center');
        text('Students (including you)', width / 2, height - 9, 'center');
        for (const [key, color, dashed] of [['yours', colors.node, false], ['any', colors.threshold, true]]) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.setLineDash(dashed ? [5, 4] : []);
            ctx.beginPath();
            for (let i = 1; i <= 366; i++) {
                const p = birthdayProbabilities(i)[key];
                if (i === 1) ctx.moveTo(x(i), y(p)); else ctx.lineTo(x(i), y(p));
            }
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x(n), y(birthdayProbabilities(n)[key]), 5, 0, Math.PI * 2);
            ctx.fill();
        }
        line(x(n), y(0), x(n), y(1), colors.fg2, true);
        const p = birthdayProbabilities(n);
        summary.textContent = `${n} students: ${percent(p.yours)} chance someone shares your birthday; ${percent(p.any)} chance any two share a birthday.`;
    }
    function children() {
        const families = childFamilies(condition);
        const size = Math.min((width - 62) / 14, (height - 106) / 14);
        const left = (width - size * 14 + 30) / 2;
        const top = 38;
        const days = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'];
        ctx.font = `${width < 400 ? 9 : 11}px sans-serif`;
        for (let i = 0; i < 14; i++) {
            const label = `${i < 7 ? 'B' : 'G'}${days[i % 7]}`;
            text(label, left + (i + 0.5) * size, top - 10, 'center');
            text(label, left - 6, top + (i + 0.5) * size, 'right');
        }
        text('Younger child →', left + size * 7, 12, 'center');
        for (const family of families) {
            ctx.globalAlpha = family.included ? 1 : 0.18;
            ctx.fillStyle = family.included ? (family.target ? colors.node : colors.threshold) : colors.rejected;
            ctx.fillRect(left + family.younger * size, top + family.older * size, size - 2, size - 2);
        }
        ctx.globalAlpha = 1;
        const kept = families.filter(f => f.included);
        const target = kept.filter(f => f.target).length;
        summary.textContent = `${kept.length} of 196 families remain. ${target} have two boys: ${target}/${kept.length} = ${percent(target / kept.length)}.`;
        const footerY = top + size * 14 + 20;
        ctx.font = 'bold 11px sans-serif';
        if (condition === 'tuesday') {
            // The older-Tuesday row was already counted. Only the rest of the
            // younger-Tuesday column is new: six boys and seven girls.
            const added = kept.filter(f => f.older !== 1);
            const boys = added.filter(f => f.target).length;
            const girls = added.length - boys;
            ctx.strokeStyle = colors.fg;
            ctx.lineWidth = 2;
            // Outline contiguous groups instead of drawing thirteen heavy boxes.
            // Row 1 was already counted, so the six added boys occupy two runs.
            for (const [start, count] of [[0, 1], [2, 5], [7, 7]]) {
                ctx.strokeRect(left + size, top + start * size, size - 2, count * size - 2);
            }
            ctx.lineWidth = 1;
            text(`Outlined additions: ${boys} boys + ${girls} girls`, width / 2, footerY, 'center');
            text(`Two boys: (7 + ${boys}) / (14 + ${added.length}) = ${percent(target / kept.length)}`, width / 2, footerY + 20, 'center');
            summary.textContent += ` Outlined cases add ${boys} older boys and ${girls} older girls, each with a younger Tuesday boy. The two-boy share falls from 7/14 to 13/27.`;
        } else {
            text(`Two boys: ${target}/${kept.length} = ${percent(target / kept.length)}`, width / 2, footerY, 'center');
        }
    }
    function monty() {
        totals.forEach((t, i) => {
            const top = 24 + i * 142;
            text(t.knowing ? 'Host knows: always reveals a goat' : 'Host opens randomly', 14, top);
            const left = 65, span = width - left - 64;
            ['stay', 'switch'].forEach((key, j) => {
                const y = top + 29 + j * 31;
                const value = t.kept ? t[key] / t.kept : 0;
                const expected = t.knowing ? (key === 'stay' ? 1 / 3 : 2 / 3) : 0.5;
                text(key === 'stay' ? 'Stay' : 'Switch', 14, y);
                ctx.fillStyle = colors.grid;
                ctx.fillRect(left, y - 9, span, 18);
                ctx.fillStyle = j ? colors.threshold : colors.node;
                ctx.fillRect(left, y - 9, span * value, 18);
                line(left + span * expected, y - 13, left + span * expected, y + 13, colors.fg, true);
                text(t.kept ? percent(value) : '—', width - 9, y, 'right');
            });
            text(`${t.kept.toLocaleString()} counted · ${(t.games - t.kept).toLocaleString()} excluded`, 14, top + 100);
        });
        summary.textContent = totals[0].games ? totals.map(t => `${t.knowing ? 'Knowing' : 'Random'} host: stay wins ${t.stay.toLocaleString()}/${t.kept.toLocaleString()}, switch wins ${t.switch.toLocaleString()}/${t.kept.toLocaleString()}.`).join(' ')
            : 'Press Step or Run to simulate both hosts. Expected stay/switch wins: 33.33%/66.67% with a knowing host; 50%/50% with a random host, given a goat reveal.';
    }
    function draw() {
        width = root.clientWidth;
        height = kind === 'children' ? Math.min(width + 10, 440) + 44 : 310;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        colors = getThemeColors();
        ctx.fillStyle = kind === 'children' ? colors.bg : colors.bg_h;
        ctx.fillRect(0, 0, width, height);
        ctx.font = '11px sans-serif';
        ctx.textBaseline = 'middle';
        if (kind === 'birthdays') birthdays();
        else if (kind === 'children') children();
        else monty();
        canvas.setAttribute('aria-label', summary.textContent);
    }
    if (input) input.addEventListener('input', draw);
    if (kind === 'monty') {
        const controller = new SimulationController({
            stepBtn: root.querySelector('[data-step]'),
            runBtn: root.querySelector('[data-run]'),
            resetBtn: root.querySelector('[data-reset]'),
            speed: 250,
            onStep() {
                for (const t of totals) for (let i = 0; i < 1000; i++) {
                    const game = montyGame(t.knowing);
                    t.games++;
                    if (!game.included) continue;
                    t.kept++;
                    t.stay += Number(game.stay);
                    t.switch += Number(game.switch);
                }
                draw();
            },
            onReset() { totals = freshTotals(); draw(); }
        });
        document.addEventListener('visibilitychange', () => { if (document.hidden) controller.stop(); });
    }
    new ResizeObserver(draw).observe(root);
    listenForThemeChange(draw);
    draw();
}
