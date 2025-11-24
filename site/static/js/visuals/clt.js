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

export function initCltLine(ids) {
    new StandardSimulation({
        ...normalizeIds(ids),
        config: {
            bins: DEFAULTS.bins,
            blockValue: DEFAULTS.blockValue,
            samplesPerFrame: DEFAULTS.samplesPerFrame,
            baseHue: COLORS.clt,
            getRange: ({ count }) => ({
                min: 0,
                max: count,
                bins: DEFAULTS.bins
            })
        },
        onStart: ({ count, sim }) => {
            let sum = 0;
            for (let i = 0; i < count; i++) {
                sum += sim.rollSample();
            }
            sim.recordSample(sum);
            return sim.valueToBin(sum);
        }
    });
}
