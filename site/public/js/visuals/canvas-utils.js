import { LAYOUT } from "./constants.js";

/**
 * Setup canvas for responsive sizing with DPI support
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {number} aspectRatio - Width/height ratio (default from constants)
 * @param {function} onResize - Callback with new logical {width, height}
 */
export function setupResponsiveCanvas(canvas, aspectRatio = LAYOUT.defaultAspectRatio, onResize) {
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
        // 1. Get the display width from the container
        const displayWidth = container.clientWidth;
        const displayHeight = displayWidth / aspectRatio;

        // 2. Set the display size (CSS pixels)
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        // 3. Set the internal buffer size (Physical pixels)
        canvas.width = Math.floor(displayWidth * dpr);
        canvas.height = Math.floor(displayHeight * dpr);

        // 4. Scale the context so drawing operations use Logical (CSS) pixels
        const ctx = canvas.getContext('2d');
        ctx.resetTransform(); // Reset before scaling to avoid compounding
        ctx.scale(dpr, dpr);

        // 5. Notify listener with Logical dimensions
        if (onResize) {
            onResize({ width: displayWidth, height: displayHeight });
        }
    }

    // Initial resize
    resize();

    // Handle window resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resize, 100);
    });
}

/**
 * Debounced resize listener
 * @param {function} callback - Function to call after resize
 * @param {number} debounceMs - Delay in ms
 */
export function onResize(callback, debounceMs = 100) {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(callback, debounceMs);
    });
}
