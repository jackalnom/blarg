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

export function getThemeColors() {
    const style = getComputedStyle(document.body);
    const bg = style.getPropertyValue('--bg').trim();

    // Primary dark mode detection: check if darkmode class exists on html element
    // This is more reliable than checking computed CSS values
    let isDark = document.documentElement.classList.contains('darkmode') || document.body.classList.contains('darkmode');

    // Fallback: if no class, try detecting from bg color
    if (!isDark && bg) {
        isDark = bg === '#1d2021' || bg === '#282828' ||
            bg.includes('40, 40, 40') || bg.includes('29, 32, 33');
    }

    return {
        bg: bg || (isDark ? '#282828' : '#fbf1c7'),
        bg_h: style.getPropertyValue('--bg_h').trim() || (isDark ? '#1d2021' : '#f9f5d7'),
        fg: style.getPropertyValue('--fg').trim() || (isDark ? '#fbf1c7' : '#282828'),
        fg2: style.getPropertyValue('--fg4').trim() || (isDark ? '#a89984' : '#7c6f64'),
        fg3: style.getPropertyValue('--fg3').trim() || (isDark ? '#bdae93' : '#665c54'),
        grid: style.getPropertyValue('--grid-color').trim() || (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
        node: style.getPropertyValue('--dag-node').trim() || (isDark ? '#458588' : '#4A90E2'),
        edge: style.getPropertyValue('--dag-edge').trim() || (isDark ? '#a89984' : '#666'),
        point: style.getPropertyValue('--dag-point').trim() || (isDark ? 'rgba(69, 133, 136, 0.5)' : 'rgba(74, 144, 226, 0.5)'),
        isDark: isDark,  // Export isDark so charts don't have to re-detect it
        // Semantic colors
        threshold: isDark ? '#d79921' : '#d65d0e',
        trendLine: isDark ? '#cc241d' : '#9d0006',
        bar: isDark ? 'rgba(104, 157, 106, 0.7)' : 'rgba(76, 175, 80, 0.7)',
        barStroke: isDark ? 'rgba(104, 157, 106, 1)' : 'rgba(76, 175, 80, 1)',
        chartFill: isDark ? 'rgba(131, 165, 152, 0.25)' : 'rgba(66, 123, 88, 0.18)',
        weekend: isDark ? 'rgba(211, 134, 155, 0.15)' : 'rgba(211, 134, 155, 0.12)',
        // Berkson/DAG specific colors
        rejected: isDark ? '#504945' : '#bdae93',
        selected: isDark ? '#b8bb26' : '#79740e'
    };
}

export function listenForThemeChange(callback) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                // Wait for CSS to update
                setTimeout(callback, 50);
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
    });
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });

    // Also listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        setTimeout(callback, 50);
    });
}
