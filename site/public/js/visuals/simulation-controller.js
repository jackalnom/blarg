/**
 * Manages simulation state and controls (Run, Step, Reset).
 */
export class SimulationController {
    constructor(config) {
        this.config = {
            stepBtn: null,
            runBtn: null,
            resetBtn: null,
            onStep: () => { },
            onReset: () => { },
            onStart: () => { },
            onStop: () => { },
            speed: 100, // ms between frames (if using timeout)
            ...config
        };

        this.isRunning = false;
        this.animationId = null;
        this.timeoutId = null;

        this.bindEvents();
    }

    bindEvents() {
        const { stepBtn, runBtn, resetBtn } = this.config;

        if (stepBtn) {
            stepBtn.addEventListener('click', () => {
                this.stop();
                this.step();
            });
        }

        if (runBtn) {
            runBtn.addEventListener('click', () => {
                this.toggleRun();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.reset();
            });
        }
    }

    step() {
        this.config.onStep();
    }

    toggleRun() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        if (this.config.runBtn) {
            this.config.runBtn.textContent = 'Stop';
        }

        this.config.onStart();
        this.loop();
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;

        if (this.config.runBtn) {
            this.config.runBtn.textContent = 'Run';
        }

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        this.config.onStop();
    }

    reset() {
        this.stop();
        this.config.onReset();
    }

    loop() {
        if (!this.isRunning) return;

        this.step();

        if (this.config.speed > 0) {
            this.timeoutId = setTimeout(() => {
                this.animationId = requestAnimationFrame(() => this.loop());
            }, this.config.speed);
        } else {
            this.animationId = requestAnimationFrame(() => this.loop());
        }
    }
}
