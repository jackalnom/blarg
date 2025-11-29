import { drawStackLineByOffsets, makeBarLayout, setInfo, getThemeColors, listenForThemeChange } from "./utils.js";
import { LAYOUT, DEFAULTS } from "./constants.js";
import { SimulationController } from "./simulation-controller.js";

/**
 * Setup canvas for responsive sizing with DPI support
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {number} aspectRatio - Width/height ratio (default 2.5 for 900:360)
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


export class SimulationRunner {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // Initialize with current logical dimensions (assuming setupResponsiveCanvas called first)
        // If not, fall back to canvas attributes (which might be physical if dpr > 1, but we'll fix on resize)
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        this.width = rect.width || canvas.width / dpr;
        this.height = rect.height || canvas.height / dpr;

        // Default config
        this.config = {
            blockPx: DEFAULTS.blockPx,
            blockValue: DEFAULTS.blockValue,
            samplesPerFrame: DEFAULTS.samplesPerFrame,
            maxSamples: Infinity,
            baseHue: 200,
            ...config
        };

        this.running = false;
        this.stopSpawning = false;
        this.total = 0;
        this.counts = [];
        this.stacks = [];
        this.bins = 0;
        this.layout = { widths: [], offsets: [] };

        // Callbacks
        this.onDraw = null; // Optional custom draw overlay
        this.onStop = null; // Called when simulation stops (e.g. max samples or manual stop)
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        // The consumer (StandardSimulation) should handle recomputing layout via its own resize listener
        // or we can trigger a callback here if needed.
        // For now, we just update dimensions.
    }

    reset({ bins, layout }) {
        this.bins = bins;
        this.layout = layout;
        this.counts = new Array(bins).fill(0);
        this.stacks = new Array(bins).fill(0);
        this.total = 0;
        this.stopSpawning = false;
        this.running = false;
    }

    start(generateFn) {
        if (this.running) return;
        this.generateFn = generateFn;
        this.running = true;
        this.loop();
    }

    stop() {
        this.running = false;
        if (this.onStop) this.onStop();
    }



    drawYAxisGridLines() {
        if (!this.config.dynamicYScale) return;

        const yScale = this.getYScale();
        const { blockPx } = this.config;

        // Calculate the capacity (total height in blocks)
        const capacity = this.height / yScale;
        const capacityInBlocks = capacity / blockPx;

        const ctx = this.ctx;
        const colors = getThemeColors();

        // Draw y-axis line on the left
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, this.height);
        ctx.stroke();

        // Determine interval (power of 2 for nice numbers)
        let interval = 1;
        while (capacityInBlocks / interval > 8) {
            interval *= 2;
        }

        // Draw tick marks and labels
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.fillStyle = colors.fg;
        ctx.font = '11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        for (let i = 0; i <= capacityInBlocks; i += interval) {
            const y = this.height - (i * blockPx * yScale);
            if (y >= 0 && y <= this.height) {
                // Draw tick mark
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(8, y);
                ctx.stroke();

                // Draw label
                if (i > 0) {
                    ctx.fillText(i.toString(), 12, y);
                }
            }
        }
    }

    step() {
        const { samplesPerFrame, maxSamples } = this.config;

        // Generate samples
        for (let i = 0; i < samplesPerFrame && !this.stopSpawning; i++) {
            if (this.total >= maxSamples) {
                this.stopSpawning = true;
                break;
            }
            const idx = this.generateFn();
            if (idx >= 0 && idx < this.bins) {
                this.counts[idx]++;
                this.stacks[idx]++;
            }
            this.total++; // Increment total per sample
        }
    }

    getMaxStackHeight() {
        let max = 1;
        for (let i = 0; i < this.stacks.length; i++) {
            const val = this.stacks[i];
            if (isFinite(val) && val > max) {
                max = val;
            }
        }
        return max;
    }

    getYScale() {
        const maxHeight = this.getMaxStackHeight();
        const { blockPx } = this.config;

        // Calculate what the current max would be in pixels
        const currentMaxPx = maxHeight * blockPx;

        // Scale so max height is at 80% of canvas (20% headroom at top)
        // capacity = currentMaxPx / 0.8 = currentMaxPx * 1.25
        const capacity = currentMaxPx * 1.25;

        // Scale factor is canvas height / capacity
        // For small values, this will be > 1, scaling them up
        // For large values, this will be < 1, scaling them down
        const newScale = this.height / capacity;
        this.lastYScale = newScale;

        return newScale;
    }

    draw() {
        if (this.config.customDraw) {
            this.config.customDraw(this.ctx, {
                width: this.width,
                height: this.height,
                total: this.total,
                counts: this.counts,
                stacks: this.stacks,
                falling: this.falling,
                layout: this.layout,
                bins: this.bins,
                blockPx: this.config.blockPx,
                baseHue: this.config.baseHue,
                yScale: this.getYScale()
            });

            if (this.onDraw) this.onDraw(this.ctx, this.total);
            return;
        }

        const { blockPx, baseHue, logY } = this.config;
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Apply dynamic y-scaling by adjusting block pixel size
        const yScale = this.config.dynamicYScale ? this.getYScale() : 1;
        const scaledBlockPx = blockPx * yScale;

        drawStackLineByOffsets(
            this.ctx,
            this.stacks,
            this.layout.offsets,
            this.layout.widths,
            scaledBlockPx,
            this.height,
            `hsl(${baseHue}, 70%, 45%)`,
            logY
        );

        if (this.onDraw) {
            this.onDraw(this.ctx, this.total);
        }
    }

    loop() {
        if (!this.running) return;
        this.step();
        this.draw();

        if (this.stopSpawning) {
            this.stop();
            return;
        }

        requestAnimationFrame(() => this.loop());
    }
}

export class StandardSimulation {
    constructor({ canvasId, stepId, runId, stepCountName, resetId, buttonId, playPauseId, sidesId, countId, logXId, logYId, logId, infoId, config, onStart, onRecompute, onStep }) {
        this.canvas = document.getElementById(canvasId);
        this.stepBtn = document.getElementById(stepId);
        this.runBtn = document.getElementById(runId);
        this.runBtn = document.getElementById(runId);
        // this.stepCountName = stepCountName; // Unused
        this.resetBtn = document.getElementById(resetId);
        this.sidesSelect = document.getElementById(sidesId);
        this.countInput = document.getElementById(countId);

        // Support both separate log toggles and combined log toggle
        if (logId) {
            // Combined log toggle for both axes (e.g., preferential-attachment)
            this.logToggle = document.getElementById(logId);
            this.logXToggle = this.logToggle;
            this.logYToggle = this.logToggle;
        } else {
            // Separate log toggles
            this.logXToggle = document.getElementById(logXId);
            this.logYToggle = document.getElementById(logYId);
        }
        this.infoEl = document.getElementById(infoId);

        // Backward compatibility: support old playPauseId if stepId not provided
        if (!this.stepBtn && (playPauseId || buttonId)) {
            this.stepBtn = document.getElementById(playPauseId || buttonId);
        }

        if (!this.canvas || !this.stepBtn) return;

        // Setup responsive canvas sizing with resize callback
        setupResponsiveCanvas(this.canvas, LAYOUT.defaultAspectRatio, ({ width, height }) => {
            if (this.runner) {
                this.runner.resize(width, height);
                this.recompute();
                this.runner.draw();
            }
        });

        // Merge defaults with provided config
        this.config = {
            dynamicYScale: true,
            maxSamples: Infinity,
            blockPx: DEFAULTS.blockPx,
            blockValue: DEFAULTS.blockValue,
            samplesPerFrame: DEFAULTS.samplesPerFrame,
            baseHue: 200,
            bins: DEFAULTS.bins,
            logY: this.logYToggle?.checked || false,
            ...config
        };

        this.runner = new SimulationRunner(this.canvas, this.config);

        // Callbacks
        this.customOnStart = onStart;
        this.customOnRecompute = onRecompute; // Optional override
        this.customOnStep = onStep; // Custom step logic

        this.startTime = 0;
        this.samples = [];
        this.rangeLow = 0;
        this.rangeHigh = 100;
        this.isPlaying = false;

        this.setup();
    }

    setup() {
        // Text overlay removed as per user request
        this.runner.onDraw = null;

        this.controller = new SimulationController({
            stepBtn: this.stepBtn,
            runBtn: this.runBtn,
            resetBtn: this.resetBtn,
            speed: 0, // Run as fast as possible
            onStart: () => {
                this.runStartTime = Date.now();
                // Set up generateFn if not already set
                if (!this.runner.generateFn) {
                    const { count } = this.getParams();
                    this.runner.generateFn = () => {
                        return this.customOnStart({ count, sim: this });
                    };
                }
            },
            onStep: () => {
                // Check duration if running
                if (this.controller.isRunning && Date.now() - this.runStartTime > 5000) {
                    this.controller.stop();
                    return;
                }

                // Default to 10 samples
                const sampleCount = 10;

                // Set up generateFn if not already set (for single step case)
                if (!this.runner.generateFn) {
                    const { count } = this.getParams();
                    this.runner.generateFn = () => {
                        return this.customOnStart({ count, sim: this });
                    };
                }

                // Generate N samples directly
                for (let i = 0; i < sampleCount; i++) {
                    const idx = this.runner.generateFn();
                    if (idx >= 0 && idx < this.runner.bins) {
                        this.runner.counts[idx]++;
                        this.runner.stacks[idx]++;
                    }
                    this.runner.total++;

                    // Call custom step callback if exists
                    if (this.customOnStep) {
                        this.customOnStep(this);
                    }
                }

                this.runner.draw();
            },
            onReset: () => {
                this.runner.running = false;
                this.runner.generateFn = null;
                this.samples = [];
                this.recompute();
                this.runner.draw();
            },
            onStop: () => {
                // Nothing specific needed here as controller handles state
            }
        });

        // Log toggles
        if (this.logXToggle) {
            this.logXToggle.addEventListener("change", () => {
                if (this.config.recomputeOnLogX) {
                    this.recompute();
                } else {
                    this.updateLayout();
                }
                this.runner.draw();
            });
        }
        if (this.logYToggle) {
            this.logYToggle.addEventListener("change", () => {
                this.runner.config.logY = this.logYToggle.checked;
                this.runner.draw();
            });
        }

        // Parameter changes (sides, count) should reset the simulation
        if (this.sidesSelect) {
            this.sidesSelect.addEventListener("change", () => {
                this.controller.reset();
            });
        }
        if (this.countInput) {
            this.countInput.addEventListener("change", () => {
                this.controller.reset();
            });
        }

        // Initial setup
        this.recompute();
        this.updateInfo();
        this.runner.draw();

        listenForThemeChange(() => {
            if (this.runner) {
                this.runner.draw();
            }
        });
    }

    // ... (updateLayout, getParams, updateInfo, rollSample, recordSample, valueToBin, recompute remain same)

    // startRun and reset are now handled by controller, but we might keep reset() as a method if called externally?
    // The controller calls onReset which contains the logic.
    // But StandardSimulation.reset() might be called by other things (like recompute).
    // Actually recompute calls runner.reset().
    // Let's keep a reset method that calls controller.reset().

    reset() {
        this.controller.reset();
    }
}



