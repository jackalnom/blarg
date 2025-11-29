import { getThemeColors } from "./utils.js";
import { AxisRenderer, linearTicks } from "./axis-renderer.js";
import { linearRegression, correlation } from "./stats.js";

export class ScatterplotRenderer {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.config = {
            padding: { top: 30, right: 20, bottom: 50, left: 60 },
            pointRadius: 3,
            showRegression: true,
            showR2: true,
            xLabel: 'X',
            yLabel: 'Y',
            title: '',
            onDrawBackground: null,
            onDrawForeground: null,
            ...config
        };
        this.axisRenderer = new AxisRenderer(ctx, {
            padding: this.config.padding,
            xLabel: this.config.xLabel,
            yLabel: this.config.yLabel
        });
    }

    draw(xData, yData, width, height) {
        const { ctx, config } = this;
        const { padding } = config;
        const colors = getThemeColors();
        const plotW = width - padding.left - padding.right;
        const plotH = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, width, height);

        // Scales
        let xMin = Math.min(...xData);
        let xMax = Math.max(...xData);
        let yMin = Math.min(...yData);
        let yMax = Math.max(...yData);

        if (xMax === xMin) { xMin -= 1; xMax += 1; }
        if (yMax === yMin) { yMin -= 1; yMax += 1; }

        // Use fixed range 0-100 if specified in config (TODO: make generic)
        // For now, let's just expose scales to the callback
        const xScale = (v) => padding.left + ((v - xMin) / (xMax - xMin)) * plotW;
        const yScale = (v) => height - padding.bottom - ((v - yMin) / (yMax - yMin)) * plotH;

        if (config.onDrawBackground) {
            config.onDrawBackground(ctx, { width, height, xScale, yScale, colors });
        }

        // Title
        if (config.title) {
            ctx.fillStyle = colors.fg;
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(config.title, width / 2, 20);
        }

        if (xData.length === 0) {
            ctx.fillStyle = colors.fg;
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('No data', width / 2, height / 2);
            return;
        }



        // Draw Axes
        this.axisRenderer.draw({
            width,
            height,
            xScale,
            yScale,
            xTicks: linearTicks(xMin, xMax),
            yTicks: linearTicks(yMin, yMax),
            xFormat: (v) => v.toFixed(1),
            yFormat: (v) => v.toFixed(1)
        });

        // Draw Points
        for (let i = 0; i < xData.length; i++) {
            ctx.fillStyle = typeof config.pointColor === 'function'
                ? config.pointColor(i, xData[i], yData[i])
                : (config.pointColor || colors.node);

            ctx.beginPath();
            ctx.arc(xScale(xData[i]), yScale(yData[i]), config.pointRadius, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Regression Line
        if (config.showRegression && xData.length > 1) {
            const { slope, intercept, r2 } = linearRegression(xData, yData);

            if (!isNaN(slope)) {
                const y1 = slope * xMin + intercept;
                const y2 = slope * xMax + intercept;

                ctx.strokeStyle = colors.trendLine;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(xScale(xMin), yScale(y1));
                ctx.lineTo(xScale(xMax), yScale(y2));
                ctx.stroke();

                if (config.showR2) {
                    ctx.fillStyle = colors.fg;
                    ctx.font = '12px sans-serif';
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`R² = ${r2.toFixed(2)}`, width - padding.right - 10, padding.top + 10);
                }
            }
        }

        if (config.onDrawForeground) {
            config.onDrawForeground(ctx, { width, height, xScale, yScale, colors });
        }
    }
}
