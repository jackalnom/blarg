import { BaseVisualization } from "./BaseVisualization.js";
import { getThemeColors } from "./utils.js";

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
    separate(boids, params) {
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
    align(boids, params) {
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
    cohere(boids, params) {
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
            return this.seek(sum, params);
        }

        return { x: 0, y: 0 };
    }

    seek(target, params) {
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

    flock(boids, params) {
        const sep = this.separate(boids, params);
        const ali = this.align(boids, params);
        const coh = this.cohere(boids, params);

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

    update(width, height, params) {
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

    draw(ctx, colors) {
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        const size = 8;

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

class BoidsVisualization extends BaseVisualization {
    constructor(containerId, ids) {
        super(containerId, 1);

        this.params = {
            separation: 1.5,
            alignment: 1.0,
            cohesion: 1.0,
            count: 100,
            maxSpeed: 3,
            maxForce: 0.05,
            perceptionRadius: 50,
            separationRadius: 25
        };

        this.boids = [];
        this.ids = ids;

        this.bindControls();
        this.reset();
        this.startLoop();
    }

    bindControls() {
        const bindSlider = (id, valueId, param) => {
            const slider = document.getElementById(id);
            const value = document.getElementById(valueId);
            if (slider) {
                slider.addEventListener('input', () => {
                    this.params[param] = parseFloat(slider.value);
                    if (value) value.textContent = this.params[param].toFixed(1);
                });
                // Init value
                if (value) value.textContent = this.params[param].toFixed(1);
            }
        };

        bindSlider(this.ids.separationId, this.ids.separationValueId, 'separation');
        bindSlider(this.ids.alignmentId, this.ids.alignmentValueId, 'alignment');
        bindSlider(this.ids.cohesionId, this.ids.cohesionValueId, 'cohesion');

        const countSlider = document.getElementById(this.ids.countId);
        const countValue = document.getElementById(this.ids.countValueId);
        if (countSlider) {
            countSlider.addEventListener('input', () => {
                this.params.count = parseInt(countSlider.value);
                if (countValue) countValue.textContent = this.params.count;
                this.reset();
            });
            if (countValue) countValue.textContent = this.params.count;
        }

        const resetBtn = document.getElementById(this.ids.resetId);
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
    }

    reset() {
        this.boids = [];
        for (let i = 0; i < this.params.count; i++) {
            this.boids.push(new Boid(
                Math.random() * this.width,
                Math.random() * this.height
            ));
        }
    }

    step() {
        // Update all boids
        // We need to pass params to boid methods now since they are instance methods
        for (const boid of this.boids) {
            boid.flock(this.boids, this.params);
        }
        for (const boid of this.boids) {
            boid.update(this.width, this.height, this.params);
        }
    }

    draw() {
        if (!this.boids) return;
        // Clear background
        this.ctx.fillStyle = this.colors.bg_h;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw boids
        for (const boid of this.boids) {
            boid.draw(this.ctx, this.colors);
        }
    }
}

export function initBoids(ids) {
    // We need to find the container ID from the canvas ID
    // This is a temporary bridge until we fully switch to container-based init
    const canvas = document.getElementById(ids.canvasId);
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container.id) {
        container.id = 'boids-container-' + Math.random().toString(36).substr(2, 9);
    }

    new BoidsVisualization(container.id, ids);
}
