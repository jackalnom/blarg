import { initUniformLine } from "./uniform.js";
import { initCltLine } from "./clt.js";
import { initLogNormalLine } from "./lognormal.js";
import { initSigmoidCurve } from "./sigmoid.js";
import { initPrefAttach } from "./pref-attach.js";

/**
 * Unified entry point for sample generation visualizations
 * @param {string} baseId - Base ID for DOM elements
 * @param {string} type - Type of generation: "uniform", "normal", "lognormal", "sigmoid", "preferential-attachment"
 */
export function initGenerateSamples(baseId, type) {
    switch (type) {
        case "uniform":
            initUniformLine(baseId);
            break;
        case "normal":
            initCltLine(baseId);
            break;
        case "lognormal":
            initLogNormalLine(baseId);
            break;
        case "sigmoid":
            initSigmoidCurve(baseId);
            break;
        case "preferential-attachment":
            initPrefAttach(baseId);
            break;
        default:
            console.warn(`Unknown generation type: ${type}`);
    }
}
