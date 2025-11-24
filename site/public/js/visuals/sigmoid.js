import { StandardSimulation } from "./simulation.js";
import { COLORS, DEFAULTS } from "./constants.js";

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
            infoId: `${base}Info`
        };
    }
    return ids;
}

export function initSigmoidCurve(ids) {
    new StandardSimulation({
        ...normalizeIds(ids),
        config: {
            bins: DEFAULTS.bins,
            blockValue: 100,
            samplesPerFrame: 300,
            baseHue: COLORS.sigmoid,
            getRange: ({ count }) => ({
                min: 0,
                max: count
            })
        },
        onStart: ({ count, sim }) => {
            let sum = 0;
            for (let i = 0; i < count; i++) {
                sum += sim.rollSample();
            }
            sim.recordSample(sum);
            return sim.valueToBin(sum);
        },
        onStep: (sim) => {
            // Convert counts to cumulative distribution (CDF)
            let cumulative = 0;
            for (let i = 0; i < sim.runner.bins; i++) {
                cumulative += sim.runner.counts[i];
                sim.runner.stacks[i] = cumulative;
            }
        }
    });
}
