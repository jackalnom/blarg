import { makeBarLayout } from "./utils.js";
import { StandardSimulation } from "./simulation.js";
import { COLORS, DEFAULTS, LAYOUT } from "./constants.js";

function normalizeIds(ids) {
    if (typeof ids === 'string') {
        const base = ids;
        return {
            canvasId: `${base}Canvas`,
            stepId: `${base}Step`,
            runId: `${base}Run`,
            stepCountName: `${base}StepCount`,
            resetId: `${base}Reset`,
            countId: `${base}Count`,
            logXId: `${base}LogX`,
            infoId: `${base}Info`
        };
    }
    return ids;
}

export function initLogNormalLine(ids) {
    new StandardSimulation({
        ...normalizeIds(ids),
        config: {
            bins: DEFAULTS.bins,
            blockValue: 150,
            samplesPerFrame: 900,
            baseHue: COLORS.lognormal,
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
                return { min: 0, max: 1 };
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
                const availableWidth = sim.runner.width - LAYOUT.leftPadding;
                sim.runner.layout = makeBarLayout(availableWidth, sim.bins, false);
            }
        },
        onStart: ({ count, sim }) => {
            let p = 1;
            for (let i = 0; i < count; i++) {
                p *= sim.rollSample();
            }
            sim.recordSample(p);
            return sim.valueToBin(p);
        }
    });
}
