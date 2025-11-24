import { LAYOUT, STYLE } from "./constants.js";

export function makeBarLayout(width, bins, logX = false) {
    if (!logX) {
        const baseW = Math.floor(width / bins);
        const extra = width - baseW * bins;
        const widths = Array.from({ length: bins }, (_, i) => baseW + (i < extra ? 1 : 0));
        const offsets = new Array(bins);
        let acc = 0;
        for (let i = 0; i < bins; i++) {
            offsets[i] = acc;
            acc += widths[i];
        }
        return { widths, offsets };
    } else {
        // Logarithmic layout
        const positions = [];
        for (let i = 0; i <= bins; i++) {
            const t = Math.log1p(i) / Math.log1p(bins);
            positions.push(t * width);
        }

        const widths = new Array(bins);
        const offsets = new Array(bins);
        for (let i = 0; i < bins; i++) {
            offsets[i] = positions[i];
            widths[i] = positions[i + 1] - positions[i];
        }
        return { widths, offsets };
    }
}

/**
 * Unified stack line drawing function
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number[]} stacks - Array of stack heights
 * @param {function} getX - Function that returns x-coordinate for bin index i
 * @param {number} blockPx - Pixels per block unit
 * @param {number} height - Canvas height
 * @param {string} color - HSL color string
 * @param {boolean} logY - Use logarithmic Y scale
 */
function drawStackLine(ctx, stacks, getX, blockPx, height, color, logY) {
    const { leftPadding, bottomPadding } = LAYOUT;
    const drawHeight = height - bottomPadding;

    // Find max without spread operator to avoid stack overflow with large arrays
    let maxStack = 1;
    for (let i = 0; i < stacks.length; i++) {
        if (stacks[i] > maxStack) maxStack = stacks[i];
    }

    // Helper to compute y from stack value
    const getY = (stackVal) => {
        const hLinear = stackVal * blockPx;
        const h = logY
            ? (Math.log1p(stackVal) / Math.log1p(maxStack)) * drawHeight
            : Math.min(hLinear, drawHeight);
        return height - bottomPadding - h;
    };

    // Fill area under the curve
    ctx.beginPath();
    ctx.moveTo(leftPadding + getX(0), height);
    for (let i = 0; i < stacks.length; i++) {
        ctx.lineTo(leftPadding + getX(i), getY(stacks[i]));
    }
    ctx.lineTo(leftPadding + getX(stacks.length - 1), height);
    ctx.closePath();
    ctx.fillStyle = color.replace('45%', '70%').replace('70%', '85%');
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Draw the line
    ctx.beginPath();
    for (let i = 0; i < stacks.length; i++) {
        const x = leftPadding + getX(i);
        const y = getY(stacks[i]);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = STYLE.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = STYLE.shadowBlur;
    ctx.shadowColor = color;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Backward-compatible wrapper using offsets and widths
export function drawStackLineByOffsets(ctx, stacks, offsets, widths, blockPx, height, color, logY) {
    const getX = (i) => offsets[i] + widths[i] / 2;
    drawStackLine(ctx, stacks, getX, blockPx, height, color, logY);
}

// Backward-compatible wrapper using positions array
export function drawStackLineByPositions(ctx, stacks, positions, blockPx, height, color, logY) {
    const getX = (i) => (positions[i] + positions[i + 1]) / 2;
    drawStackLine(ctx, stacks, getX, blockPx, height, color, logY);
}

export function setInfo(el, sides, count) {
    if (el) el.textContent = `d${sides} × ${count}`;
}
