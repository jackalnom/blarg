import { setupResponsiveCanvas } from "./canvas-utils.js";
import { getThemeColors, listenForThemeChange } from "./utils.js";
import { LAYOUT } from "./constants.js";

/**
 * Base class for all visualizations
 * Handles:
 * - Canvas setup and resizing
 * - Theme change listening
 * - Basic animation loop
 */
export class BaseVisualization {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn(`Container not found: ${containerId}`);
            return;
        }

        // Find canvas - assume it has data-role="canvas" or is the first canvas
        this.canvas = this.container.querySelector('canvas[data-role="canvas"]') || this.container.querySelector('canvas');
        if (!this.canvas) {
            console.warn(`Canvas not found in container: ${containerId}`);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.colors = getThemeColors();
        this.animationId = null;
        this.isRunning = false;

        // Auto-setup
        this.setupCanvas();
        this.setupThemeListener();
    }

    setupCanvas() {
        setupResponsiveCanvas(this.canvas, LAYOUT.defaultAspectRatio, ({ width, height }) => {
            this.width = width;
            this.height = height;
            this.draw();
        });
    }

    setupThemeListener() {
        listenForThemeChange(() => {
            this.colors = getThemeColors();
            this.draw();
        });
    }

    // Lifecycle methods to be overridden
    draw() {
        // Clear canvas by default
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = this.colors.bg;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    startLoop() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.loop();
    }

    stopLoop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    loop() {
        if (!this.isRunning) return;
        this.step();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    }

    step() {
        // Override me
    }
}
