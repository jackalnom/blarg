import { getThemeColors } from "./utils.js";

/**
 * Renders axes, grids, and labels for charts.
 */
export class AxisRenderer {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.config = {
            padding: { top: 20, right: 20, bottom: 40, left: 50 },
            xLabel: '',
            yLabel: '',
            grid: true,
            ...config
        };
    }

    /**
     * Draw axes, grid, and labels
     * @param {object} params
     * @param {number} params.width - Canvas width
     * @param {number} params.height - Canvas height
     * @param {object} params.xScale - Scale function for X
     * @param {object} params.yScale - Scale function for Y
     * @param {number[]} params.xTicks - Array of tick values for X
     * @param {number[]} params.yTicks - Array of tick values for Y
     * @param {function} params.xFormat - Formatter for X labels
     * @param {function} params.yFormat - Formatter for Y labels
     */
    draw({ width, height, xScale, yScale, xTicks, yTicks, xFormat, yFormat }) {
        const { ctx, config } = this;
        const { padding } = config;
        const colors = getThemeColors();

        const plotW = width - padding.left - padding.right;
        const plotH = height - padding.top - padding.bottom;

        // Draw Axes Lines
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // X Ticks & Grid
        if (xTicks) {
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.font = "11px system-ui, sans-serif";

            xTicks.forEach(t => {
                const x = xScale(t);

                // Grid
                if (config.grid) {
                    ctx.strokeStyle = colors.grid;
                    ctx.beginPath();
                    ctx.moveTo(x, padding.top);
                    ctx.lineTo(x, height - padding.bottom);
                    ctx.stroke();
                }

                // Tick mark
                ctx.strokeStyle = colors.grid;
                ctx.beginPath();
                ctx.moveTo(x, height - padding.bottom);
                ctx.lineTo(x, height - padding.bottom + 4);
                ctx.stroke();

                // Label
                ctx.fillStyle = colors.fg;
                ctx.fillText(xFormat ? xFormat(t) : t, x, height - padding.bottom + 6);
            });
        }

        // Y Ticks & Grid
        if (yTicks) {
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.font = "11px system-ui, sans-serif";

            yTicks.forEach(t => {
                const y = yScale(t);

                // Grid
                if (config.grid) {
                    ctx.strokeStyle = colors.grid;
                    ctx.beginPath();
                    ctx.moveTo(padding.left, y);
                    ctx.lineTo(width - padding.right, y);
                    ctx.stroke();
                }

                // Tick mark
                ctx.strokeStyle = colors.grid;
                ctx.beginPath();
                ctx.moveTo(padding.left - 4, y);
                ctx.lineTo(padding.left, y);
                ctx.stroke();

                // Label
                ctx.fillStyle = colors.fg;
                ctx.fillText(yFormat ? yFormat(t) : t, padding.left - 8, y);
            });
        }

        // Axis Labels
        if (config.xLabel) {
            ctx.fillStyle = colors.fg;
            ctx.font = "12px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(config.xLabel, padding.left + plotW / 2, height - padding.bottom + 25);
        }

        if (config.yLabel) {
            ctx.save();
            ctx.translate(15, padding.top + plotH / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.font = "12px system-ui, sans-serif";
            ctx.fillStyle = colors.fg;
            ctx.fillText(config.yLabel, 0, 0);
            ctx.restore();
        }
    }
}

/**
 * Generate linear ticks
 * @param {number} min 
 * @param {number} max 
 * @param {number} desired 
 * @returns {number[]}
 */
export function linearTicks(min, max, desired = 5) {
    const span = max - min;
    if (span <= 0) return [min];
    const rawStep = span / desired;
    const step = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const niceStep = rawStep / step >= 5 ? 5 * step : rawStep / step >= 2 ? 2 * step : step;
    const start = Math.ceil(min / niceStep) * niceStep;
    const ticks = [];
    for (let t = start; t <= max; t += niceStep) ticks.push(t);
    if (ticks.length === 0) ticks.push(max);
    return ticks;
}
