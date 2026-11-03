import assert from 'node:assert/strict';
import { initDiceCounting } from '../static/js/visuals/dice-counting.js';
import { initCoinFlips } from '../static/js/visuals/coin-flips.js';
import { initTuesdayFamilies } from '../static/js/visuals/tuesday-families.js';
import { initMontyPiles } from '../static/js/visuals/monty-piles.js';

// Exercise the real shared renderer and controls without a browser dependency.
const timers = new Map();
const frames = new Map();
let nextId = 1;
globalThis.setTimeout = fn => { const id = nextId++; timers.set(id, fn); return id; };
globalThis.clearTimeout = id => timers.delete(id);
globalThis.requestAnimationFrame = fn => { const id = nextId++; frames.set(id, fn); return id; };
globalThis.cancelAnimationFrame = id => frames.delete(id);
function tick() {
    for (const queue of [timers, frames]) {
        const pending = [...queue.values()];
        queue.clear();
        pending.forEach(fn => fn());
    }
}
globalThis.window = { devicePixelRatio: 2, matchMedia: () => ({ addEventListener() {} }) };
globalThis.ResizeObserver = class { observe() {} };
globalThis.MutationObserver = class { observe() {} };
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });

function harness(width, dark) {
    const labels = [];
    const buttons = {};
    for (const name of ['step', 'run', 'reset']) {
        buttons[name] = { textContent: name === 'run' ? 'Run' : name,
            addEventListener: (_, fn) => { buttons[name].click = fn; } };
    }
    const summary = {};
    const ctx = new Proxy({}, {
        get(target, key) {
            if (key in target) return target[key];
            if (key === 'fillText') return (text, x, y) => {
                assert.ok(Number.isFinite(x) && Number.isFinite(y));
                assert.ok(x >= 0 && x <= width && y >= 0 && y <= parseFloat(canvas.style.height), `Text outside canvas: ${text}`);
                labels.push(String(text));
            };
            return (...args) => args.filter(v => typeof v === 'number').forEach(v => assert.ok(Number.isFinite(v)));
        }
    });
    const canvas = { style: {}, getContext: () => ctx, setAttribute() {} };
    const root = { clientWidth: width, querySelector: selector => selector === 'canvas' ? canvas
        : selector === '[data-summary]' ? summary : buttons[selector.slice(6, -1)] };
    let onVisibility;
    globalThis.document = {
        hidden: false, getElementById: () => root,
        body: { classList: { contains: () => dark } },
        documentElement: { classList: { contains: () => dark } },
        addEventListener: (_, fn) => { onVisibility = fn; }
    };
    return { labels, buttons, summary, canvas, hide() { document.hidden = true; onVisibility(); } };
}

const dice = [];
for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) dice.push([(a + .5) / 6, (b + .5) / 6]);
const coins = [[.1, .1], [.1, .9], [.9, .1], [.9, .9]];
const families = [];
for (let a = 0; a < 14; a++) for (let b = 0; b < 14; b++) families.push([(a + .5) / 14, (b + .5) / 14]);
const monty = [];
for (let car = 0; car < 3; car++) for (const k of [.25, .75]) for (const r of [.25, .75]) monty.push([(car + .5) / 3, k, r]);
const cases = [
    [initDiceCounting, dice, ['Sum is 7 · 6/36 rolls', '16.7%']],
    [initCoinFlips, coins, ['Two heads · 1/2 kept', 'Two heads · 1/3 kept', '33.3%']],
    [initTuesdayFamilies, families, ['Two boys · 7/14 kept', 'Two boys · 13/27 kept', '48.1%']],
    [initMontyPiles, monty, ['Switch wins · 8/12 kept', 'Switch wins · 4/8 kept', '66.7%']]
];
const originalRandom = Math.random;
for (const width of [320, 900]) for (const dark of [false, true]) {
    for (const [init, trials, expected] of cases) {
        const h = harness(width, dark);
        init({ id: 'visual' });
        for (const trial of trials) {
            let n = 0;
            Math.random = () => trial[n++];
            h.labels.length = 0;
            h.buttons.step.click();
        }
        expected.forEach(text => assert.ok(h.labels.includes(text), `Missing ${text}`));
        assert.ok(h.labels.includes('Trials'));
        if (init === initMontyPiles) assert.ok(h.labels.some(text => text.startsWith('Opens door ')));
        Math.random = () => .1;
        h.buttons.run.click();
        assert.equal(h.buttons.run.textContent, 'Stop');
        const before = h.summary.textContent;
        tick();
        assert.notEqual(h.summary.textContent, before);
        h.buttons.run.click();
        const stopped = h.summary.textContent;
        tick();
        assert.equal(h.summary.textContent, stopped);
        h.buttons.run.click();
        h.buttons.reset.click();
        assert.equal(h.buttons.run.textContent, 'Run');
        h.labels.length = 0;
        h.buttons.step.click();
        assert.match(h.summary.textContent, / 1:/);
        assert.ok(h.labels.includes('100.0%') || h.labels.includes('0.0%'));
        h.buttons.run.click();
        h.hide();
        assert.equal(h.buttons.run.textContent, 'Run');
        assert.equal(timers.size + frames.size, 0);
    }
}
Math.random = originalRandom;
console.log('All outcomes, chart denominators, light/dark and narrow/wide drawing bounds, and Run/Stop/Reset passed.');
