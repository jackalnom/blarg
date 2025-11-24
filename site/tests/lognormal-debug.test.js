import assert from 'assert';

console.log("Running Log-Normal Debug tests...");

// Mock DOM
const elements = {};
global.document = {
    getElementById: (id) => {
        if (elements[id]) return elements[id];

        if (id === 'test-canvas') {
            elements[id] = {
                getContext: () => ({
                    clearRect: () => { },
                    fillRect: () => { },
                    strokeRect: () => { },
                    fillText: () => { },
                    strokeText: () => { },
                    measureText: () => ({ width: 0 }),
                    beginPath: () => { },
                    moveTo: () => { },
                    lineTo: () => { },
                    closePath: () => { },
                    stroke: () => { },
                    fill: () => { },
                    arc: () => { },
                    save: () => { },
                    restore: () => { },
                    translate: () => { },
                    scale: () => { },
                    rotate: () => { },
                    setTransform: () => { },
                    resetTransform: () => { },
                    drawImage: () => { },
                    createLinearGradient: () => ({ addColorStop: () => { } }),
                    canvas: { width: 800, height: 400 }
                }),
                parentElement: { clientWidth: 800 },
                getBoundingClientRect: () => ({ width: 800, height: 400 }),
                width: 800,
                height: 400,
                style: {}
            };
        } else if (id === 'test-logx') {
            elements[id] = {
                type: 'checkbox',
                checked: false,
                addEventListener: (event, cb) => {
                    if (event === 'change') global.logXCallback = cb;
                }
            };
        } else if (id === 'test-step') {
            elements[id] = {
                addEventListener: () => { }
            };
        } else if (id === 'test-count') {
            elements[id] = {
                value: '1',
                addEventListener: () => { }
            };
        }
        return elements[id] || null;
    },
    querySelector: () => null
};

global.window = {
    devicePixelRatio: 1,
    addEventListener: () => { },
    getComputedStyle: () => ({ paddingLeft: '0px', paddingRight: '0px' })
};

// Import modules
const { StandardSimulation } = await import('../static/js/visuals/simulation.js');
const { initLogNormalLine } = await import('../static/js/visuals/lognormal.js');

// Test: Log-Normal Initialization
console.log("Test: Log-Normal Initialization...");
{
    // Mock initLogNormalLine execution context
    // We can't easily spy on internal StandardSimulation instance created by initLogNormalLine
    // So we'll recreate the config and test StandardSimulation directly with it.

    // Copy config from lognormal.js (manual copy for test)
    const config = {
        bins: 100,
        recomputeOnLogX: true,
        getRange: ({ count, logX }) => {
            if (logX) {
                const mean = -count;
                const stdDev = Math.sqrt(count);
                return {
                    min: mean - 4 * stdDev,
                    max: 0
                };
            }
            return {
                min: 0,
                max: 1
            };
        },
        customValueToBin: (val, sim) => {
            const { logX } = sim.getParams();
            const bins = sim.bins;

            if (logX) {
                if (val <= 0) return -1;
                const logVal = Math.log(val);
                const t = (logVal - sim.rangeLow) / (sim.rangeHigh - sim.rangeLow);
                return Math.min(Math.floor(t * bins), bins - 1);
            }

            const t = (val - sim.rangeLow) / (sim.rangeHigh - sim.rangeLow);
            return Math.min(Math.floor(t * bins), bins - 1);
        },
        customUpdateLayout: (sim) => {
            // Mock layout
            sim.runner.layout = { widths: Array(100).fill(8), offsets: Array(100).fill(0) };
        }
    };

    const sim = new StandardSimulation({
        canvasId: 'test-canvas',
        stepId: 'test-step',
        logXId: 'test-logx',
        countId: 'test-count',
        config: config,
        onStart: ({ count, sim }) => {
            let p = 1;
            for (let i = 0; i < count; i++) {
                p *= sim.rollSample();
            }
            sim.recordSample(p);
            return sim.valueToBin(p);
        }
    });

    // 1. Check Initial State (Linear)
    console.log("Checking Initial State (Linear)...");
    assert.strictEqual(sim.rangeLow, 0, 'Initial rangeLow should be 0');
    assert.strictEqual(sim.rangeHigh, 1, 'Initial rangeHigh should be 1');

    // Generate a sample
    const bin = sim.customOnStart({ count: 1, sim });
    console.log(`Generated sample bin: ${bin}`);
    assert(bin >= 0 && bin < 100, 'Bin should be valid');

    // 2. Toggle Log X
    console.log("Toggling Log X...");
    const logXToggle = document.getElementById('test-logx');
    logXToggle.checked = true;
    if (global.logXCallback) global.logXCallback();

    console.log(`Log Mode Range: [${sim.rangeLow}, ${sim.rangeHigh}]`);
    assert(sim.rangeLow < 0, 'Log rangeLow should be negative');
    assert.strictEqual(sim.rangeHigh, 0, 'Log rangeHigh should be 0');

    // Generate a sample in Log Mode
    const logBin = sim.customOnStart({ count: 1, sim });
    console.log(`Generated Log sample bin: ${logBin}`);
    assert(logBin >= 0 && logBin < 100, 'Log bin should be valid');

    console.log("✓ Log-Normal logic seems correct in isolation");
}

console.log("\n✅ All Log-Normal Debug tests passed!");
