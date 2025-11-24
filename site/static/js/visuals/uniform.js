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
            logXId: `${base}LogX`,
            logYId: `${base}LogY`,
            infoId: `${base}Info`
        };
    }
    return ids;
}

export function initUniformLine(ids) {
    new StandardSimulation({
        ...normalizeIds(ids),
        config: {
            bins: DEFAULTS.bins,
            blockValue: DEFAULTS.blockValue,
            samplesPerFrame: 5000,
            baseHue: COLORS.uniform,
            getRange: () => ({ min: 0, max: 1 })
        },
        onStart: ({ sim }) => {
            const val = sim.rollSample();
            sim.recordSample(val);
            return sim.valueToBin(val);
        }
    });
}
