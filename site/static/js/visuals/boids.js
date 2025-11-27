import { getThemeColors, listenForThemeChange } from "./utils.js";

export function initBoids(ids) {
    const canvas = document.getElementById(ids.canvasId);
    const separationSlider = document.getElementById(ids.separationId);
    const alignmentSlider = document.getElementById(ids.alignmentId);
    const cohesionSlider = document.getElementById(ids.cohesionId);
    const separationValue = document.getElementById(ids.separationValueId);
    const alignmentValue = document.getElementById(ids.alignmentValueId);
    const cohesionValue = document.getElementById(ids.cohesionValueId);
    const countSlider = document.getElementById(ids.countId);
    const countValue = document.getElementById(ids.countValueId);
    const resetBtn = document.getElementById(ids.resetId);

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let boids = [];
    let animationId = null;

    // Simulation parameters
    const params = {
        separation: 1.5,
        alignment: 1.0,
        cohesion: 1.0,
        count: 100,
        maxSpeed: 3,
        maxForce: 0.05,
        perceptionRadius: 50,
        separationRadius: 25
    };

    class Boid {
        constructor(x, y) {
            this.position = { x, y };
            this.velocity = {
                x: (Math.random() - 0.5) * 4,
                y: (Math.random() - 0.5) * 4
            };
            this.acceleration = { x: 0, y: 0 };
        }

        // Separation: steer away from nearby boids
        separate(boids) {
            let steer = { x: 0, y: 0 };
            let count = 0;

            for (const other of boids) {
                const d = this.distance(other);
                if (d > 0 && d < params.separationRadius) {
                    // Vector pointing away from neighbor
                    let diff = {
                        x: this.position.x - other.position.x,
                        y: this.position.y - other.position.y
                    };
                    // Weight by distance (closer = stronger)
                    diff = this.normalize(diff);
                    diff.x /= d;
                    diff.y /= d;
                    steer.x += diff.x;
                    steer.y += diff.y;
                    count++;
                }
            }

            if (count > 0) {
                steer.x /= count;
                steer.y /= count;
                steer = this.normalize(steer);
                steer.x *= params.maxSpeed;
                steer.y *= params.maxSpeed;
                steer.x -= this.velocity.x;
                steer.y -= this.velocity.y;
                steer = this.limit(steer, params.maxForce);
            }

            return steer;
        }

        // Alignment: steer towards average heading of neighbors
        align(boids) {
            let sum = { x: 0, y: 0 };
            let count = 0;

            for (const other of boids) {
                const d = this.distance(other);
                if (d > 0 && d < params.perceptionRadius) {
                    sum.x += other.velocity.x;
                    sum.y += other.velocity.y;
                    count++;
                }
            }

            if (count > 0) {
                sum.x /= count;
                sum.y /= count;
                sum = this.normalize(sum);
                sum.x *= params.maxSpeed;
                sum.y *= params.maxSpeed;
                let steer = {
                    x: sum.x - this.velocity.x,
                    y: sum.y - this.velocity.y
                };
                return this.limit(steer, params.maxForce);
            }

            return { x: 0, y: 0 };
        }

        // Cohesion: steer towards center of mass of neighbors
        cohere(boids) {
            let sum = { x: 0, y: 0 };
            let count = 0;

            for (const other of boids) {
                const d = this.distance(other);
                if (d > 0 && d < params.perceptionRadius) {
                    sum.x += other.position.x;
                    sum.y += other.position.y;
                    count++;
                }
            }

            if (count > 0) {
                sum.x /= count;
                sum.y /= count;
                return this.seek(sum);
            }

            return { x: 0, y: 0 };
        }

        seek(target) {
            let desired = {
                x: target.x - this.position.x,
                y: target.y - this.position.y
            };
            desired = this.normalize(desired);
            desired.x *= params.maxSpeed;
            desired.y *= params.maxSpeed;
            let steer = {
                x: desired.x - this.velocity.x,
                y: desired.y - this.velocity.y
            };
            return this.limit(steer, params.maxForce);
        }

        flock(boids) {
            const sep = this.separate(boids);
            const ali = this.align(boids);
            const coh = this.cohere(boids);

            // Apply weights from sliders
            sep.x *= params.separation;
            sep.y *= params.separation;
            ali.x *= params.alignment;
            ali.y *= params.alignment;
            coh.x *= params.cohesion;
            coh.y *= params.cohesion;

            this.acceleration.x += sep.x + ali.x + coh.x;
            this.acceleration.y += sep.y + ali.y + coh.y;
        }

        update() {
            this.velocity.x += this.acceleration.x;
            this.velocity.y += this.acceleration.y;
            this.velocity = this.limit(this.velocity, params.maxSpeed);
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.acceleration = { x: 0, y: 0 };

            // Wrap around edges
            if (this.position.x > width) this.position.x = 0;
            if (this.position.x < 0) this.position.x = width;
            if (this.position.y > height) this.position.y = 0;
            if (this.position.y < 0) this.position.y = height;
        }

        draw(ctx) {
            const angle = Math.atan2(this.velocity.y, this.velocity.x);
            const size = 8;
            const colors = getThemeColors();

            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(angle);

            // Draw triangle pointing in direction of movement
            ctx.beginPath();
            ctx.moveTo(size, 0);
            ctx.lineTo(-size * 0.6, size * 0.4);
            ctx.lineTo(-size * 0.6, -size * 0.4);
            ctx.closePath();

            ctx.fillStyle = colors.node;
            ctx.fill();

            ctx.restore();
        }

        distance(other) {
            const dx = this.position.x - other.position.x;
            const dy = this.position.y - other.position.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        normalize(v) {
            const mag = Math.sqrt(v.x * v.x + v.y * v.y);
            if (mag > 0) {
                return { x: v.x / mag, y: v.y / mag };
            }
            return { x: 0, y: 0 };
        }

        limit(v, max) {
            const mag = Math.sqrt(v.x * v.x + v.y * v.y);
            if (mag > max) {
                return { x: (v.x / mag) * max, y: (v.y / mag) * max };
            }
            return v;
        }
    }

    function initBoids() {
        boids = [];
        for (let i = 0; i < params.count; i++) {
            boids.push(new Boid(
                Math.random() * width,
                Math.random() * height
            ));
        }
    }

    function draw() {
        const colors = getThemeColors();
        ctx.fillStyle = colors.bg_h;
        ctx.fillRect(0, 0, width, height);

        for (const boid of boids) {
            boid.flock(boids);
        }

        for (const boid of boids) {
            boid.update();
            boid.draw(ctx);
        }

        animationId = requestAnimationFrame(draw);
    }

    function updateSliderValue(slider, valueEl) {
        if (slider && valueEl) {
            valueEl.textContent = parseFloat(slider.value).toFixed(1);
        }
    }

    function resizeCanvas() {
        const container = canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = container.clientWidth;
        const displayHeight = Math.min(400, displayWidth * 0.5);

        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
        canvas.width = Math.floor(displayWidth * dpr);
        canvas.height = Math.floor(displayHeight * dpr);

        ctx.resetTransform();
        ctx.scale(dpr, dpr);

        width = displayWidth;
        height = displayHeight;
    }

    // Setup event listeners
    if (separationSlider) {
        separationSlider.addEventListener('input', () => {
            params.separation = parseFloat(separationSlider.value);
            updateSliderValue(separationSlider, separationValue);
        });
        updateSliderValue(separationSlider, separationValue);
    }

    if (alignmentSlider) {
        alignmentSlider.addEventListener('input', () => {
            params.alignment = parseFloat(alignmentSlider.value);
            updateSliderValue(alignmentSlider, alignmentValue);
        });
        updateSliderValue(alignmentSlider, alignmentValue);
    }

    if (cohesionSlider) {
        cohesionSlider.addEventListener('input', () => {
            params.cohesion = parseFloat(cohesionSlider.value);
            updateSliderValue(cohesionSlider, cohesionValue);
        });
        updateSliderValue(cohesionSlider, cohesionValue);
    }

    if (countSlider) {
        countSlider.addEventListener('input', () => {
            params.count = parseInt(countSlider.value);
            updateSliderValue(countSlider, countValue);
            initBoids();
        });
        updateSliderValue(countSlider, countValue);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            initBoids();
        });
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
    });

    // Initialize
    resizeCanvas();
    initBoids();
    draw();
}
