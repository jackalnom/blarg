import { StandardSimulation } from "./simulation.js";
import { COLORS, LAYOUT } from "./constants.js";

function normalizeIds(ids) {
    if (typeof ids === 'string') {
        const base = ids;
        return {
            canvasId: `${base}Canvas`,
            stepId: `${base}Step`,
            runId: `${base}Run`,
            stepCountName: `${base}StepCount`,
            resetId: `${base}Reset`,
            logXId: `${base}LogX`,
            logYId: `${base}LogY`
        };
    }
    return ids;
}

function makePositions(width, bins, logX) {
    const arr = [];
    for (let i = 0; i <= bins; i++) {
        const t = i / bins;
        const u = logX ? Math.log1p(i) / Math.log1p(bins) : t;
        arr.push(u * width);
    }
    return arr;
}

export function initPrefAttach(ids) {
    const blockValue = 4;
    const pNew = 0.02;
    const smooth = 0.18;

    // State specific to this simulation
    let totalMass = 1;
    let maxSize = 1;
    let sizes = [1];
    let sizeCounts = { 1: 1 };

    new StandardSimulation({
        ...normalizeIds(ids),
        config: {
            blockValue,
            samplesPerFrame: 1500,
            baseHue: COLORS.prefAttach,
            bins: 70,
            customUpdateLayout: (sim) => {
                const { logX } = sim.getParams();
                const activeBins = Math.max(70, maxSize);
                const availableWidth = sim.runner.width - LAYOUT.leftPadding;
                const positions = makePositions(availableWidth, activeBins, logX);

                const offsets = [];
                const widths = [];
                for (let i = 0; i < positions.length - 1; i++) {
                    offsets.push(positions[i]);
                    widths.push(positions[i + 1] - positions[i]);
                }
                sim.runner.layout = { offsets, widths };
            }
        },
        onRecompute: (sim) => {
            // Reset state
            totalMass = 1;
            maxSize = 1;
            sizes = [1];
            sizeCounts = { 1: 1 };

            // Reset runner with initial layout
            sim.updateLayout();
            sim.runner.reset({ bins: 70, layout: sim.runner.layout });
            sim.runner.counts = new Array(70).fill(0);
            sim.runner.stacks = new Array(70).fill(0);
        },
        onStep: (sim) => {
            // 1. Refresh bins from sizeCounts
            // Ensure runner has enough capacity
            const need = Math.max(0, maxSize - sim.runner.counts.length);
            if (need > 0) {
                sim.runner.counts.push(...Array(need).fill(0));
                sim.runner.stacks.push(...Array(need).fill(0));
            }

            sim.runner.counts.fill(0);
            for (const [sizeStr, count] of Object.entries(sizeCounts)) {
                const size = Number(sizeStr);
                const idx = Math.max(0, size - 1);
                sim.runner.counts[idx] += count;
            }

            // 2. Update layout (for Log X scaling which depends on maxSize)
            sim.updateLayout();

            // 3. Custom smoothing for stacks
            for (let i = 0; i < sim.runner.counts.length; i++) {
                const targetBlocks = sim.runner.counts[i] / blockValue;
                sim.runner.stacks[i] = sim.runner.stacks[i] + (targetBlocks - sim.runner.stacks[i]) * smooth;
            }
        },
        onStart: ({ sim }) => {
            if (Math.random() < pNew) {
                sizes.push(1);
                sizeCounts[1] = (sizeCounts[1] || 0) + 1;
                totalMass += 1;
            } else {
                // Weighted pick
                const r = Math.random() * totalMass;
                let acc = 0;
                let pickedIdx = sizes.length - 1;
                for (let i = 0; i < sizes.length; i++) {
                    acc += sizes[i];
                    if (acc >= r) {
                        pickedIdx = i;
                        break;
                    }
                }

                const oldSize = sizes[pickedIdx];
                const newSize = oldSize + 1;
                sizes[pickedIdx] = newSize;

                sizeCounts[oldSize]--;
                if (sizeCounts[oldSize] === 0) delete sizeCounts[oldSize];
                sizeCounts[newSize] = (sizeCounts[newSize] || 0) + 1;

                totalMass += 1;
                if (newSize > maxSize) maxSize = newSize;
            }
            // Skip standard counting/binning
            return -1;
        }
    });
}
