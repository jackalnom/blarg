/**
 * Predator-Prey Ecosystem Simulation
 * Cats chase mice, mice eat grass, grass spreads
 */

import { setupResponsiveCanvas } from "./simulation.js";

export function initEcosystem(config) {
    const canvas = document.getElementById(config.canvasId);
    const chartCanvas = document.getElementById(config.chartId);
    const stepBtn = document.getElementById(config.stepId);
    const runBtn = document.getElementById(config.runId);
    const resetBtn = document.getElementById(config.resetId);
    const logScaleCheckbox = document.getElementById(config.logScaleId);

    const catSpeedSlider = document.getElementById(config.catSpeedId);
    const catSpeedValue = document.getElementById(config.catSpeedValueId);
    const mouseSpeedSlider = document.getElementById(config.mouseSpeedId);
    const mouseSpeedValue = document.getElementById(config.mouseSpeedValueId);
    const grassGrowthSlider = document.getElementById(config.grassGrowthId);
    const grassGrowthValue = document.getElementById(config.grassGrowthValueId);
    const visionSlider = document.getElementById(config.visionId);
    const visionValue = document.getElementById(config.visionValueId);
    const mouseReproduceSlider = document.getElementById(config.mouseReproduceId);
    const mouseReproduceValue = document.getElementById(config.mouseReproduceValueId);
    const catReproduceSlider = document.getElementById(config.catReproduceId);
    const catReproduceValue = document.getElementById(config.catReproduceValueId);
    const starvationSlider = document.getElementById(config.starvationId);
    const starvationValue = document.getElementById(config.starvationValueId);

    if (!canvas || !chartCanvas) return;

    const ctx = canvas.getContext('2d');
    const chartCtx = chartCanvas.getContext('2d');

    // Grid settings
    const GRID_SIZE = 40;
    let CELL_SIZE = 15; // Initial, will be updated on resize

    // Entity types
    const GRASS = 'grass';
    const MOUSE = 'mouse';
    const CAT = 'cat';

    // Game rules (constants)
    const BASE_GRASS_SPREAD_CHANCE = 0.05;
    const BASE_GRASS_RANDOM_SPAWN_CHANCE = 0.001; // Much less common than spreading

    // Parameters (controlled by sliders)
    let catSpeed = 1.5;
    let mouseSpeed = 1.0;
    let grassGrowth = 1.0;
    let visionRange = 10; // How far cats can see (in cells)
    let mouseReproduceThreshold = 5; // Number of grass to eat before reproducing
    let catReproduceThreshold = 15; // Number of mice to eat before reproducing
    let starvationThreshold = 50; // Turns without eating before starvation

    let grid = [];
    let mice = [];
    let cats = [];
    let bloodSplats = []; // {x, y, age}
    let history = [];
    let running = false;
    let animationId = null;
    let useLogScale = false;
    let hoveredEntity = null;

    // Setup responsive canvas
    setupResponsiveCanvas(canvas, 1, ({ width, height }) => {
        // Update CELL_SIZE to fit the grid in the available width
        CELL_SIZE = width / GRID_SIZE;
        draw();
    });

    function initGrid() {
        grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
        mice = [];
        cats = [];
        bloodSplats = [];
        history = [];

        // Initial grass (50% coverage)
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (Math.random() < 0.5) {
                    grid[y][x] = GRASS;
                }
            }
        }

        // Initial mice (30 random positions)
        for (let i = 0; i < 30; i++) {
            const x = Math.floor(Math.random() * GRID_SIZE);
            const y = Math.floor(Math.random() * GRID_SIZE);
            mice.push({ x, y, eaten: 0, turnsSinceEating: 0 });
        }

        // Initial cats (5 random positions)
        for (let i = 0; i < 5; i++) {
            const x = Math.floor(Math.random() * GRID_SIZE);
            const y = Math.floor(Math.random() * GRID_SIZE);
            cats.push({ x, y, eaten: 0, turnsSinceEating: 0 });
        }

        recordHistory();
    }

    function recordHistory() {
        const grassCount = grid.flat().filter(c => c === GRASS).length;
        history.push({
            grass: grassCount,
            mice: mice.length,
            cats: cats.length
        });

        // Keep last 200 timesteps
        if (history.length > 200) history.shift();
    }

    function findNearest(x, y, targets) {
        let nearest = null;
        let minDist = Infinity;

        for (const target of targets) {
            const dx = target.x - x;
            const dy = target.y - y;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) {
                minDist = dist;
                nearest = target;
            }
        }

        return nearest;
    }

    function moveToward(entity, targetX, targetY, speed) {
        // Move multiple steps based on speed (with probability for fractional speeds)
        const steps = Math.floor(speed) + (Math.random() < (speed % 1) ? 1 : 0);

        for (let i = 0; i < steps; i++) {
            // Move toward target
            const dx = targetX - entity.x;
            const dy = targetY - entity.y;

            if (dx === 0 && dy === 0) break;

            if (Math.abs(dx) > Math.abs(dy)) {
                entity.x += Math.sign(dx);
            } else if (dy !== 0) {
                entity.y += Math.sign(dy);
            } else if (dx !== 0) {
                entity.x += Math.sign(dx);
            }

            // Wrap around edges
            entity.x = (entity.x + GRID_SIZE) % GRID_SIZE;
            entity.y = (entity.y + GRID_SIZE) % GRID_SIZE;
        }
    }

    function step() {
        // Mice eat grass and move
        const newMice = [];
        for (const mouse of mice) {
            // Increment starvation counter
            mouse.turnsSinceEating += 1;

            // Check if starved
            if (mouse.turnsSinceEating > starvationThreshold) {
                continue; // Dies from starvation
            }

            // Check if on grass - eat it
            if (grid[mouse.y][mouse.x] === GRASS) {
                grid[mouse.y][mouse.x] = null;
                mouse.eaten += 1;
                mouse.turnsSinceEating = 0; // Reset starvation counter
            }

            // Mice always move randomly (wandering behavior)
            const steps = Math.floor(mouseSpeed) + (Math.random() < (mouseSpeed % 1) ? 1 : 0);
            for (let i = 0; i < steps; i++) {
                mouse.x += Math.floor(Math.random() * 3) - 1;
                mouse.y += Math.floor(Math.random() * 3) - 1;
                // Wrap around edges
                mouse.x = (mouse.x + GRID_SIZE) % GRID_SIZE;
                mouse.y = (mouse.y + GRID_SIZE) % GRID_SIZE;
            }

            // Reproduce if eaten enough grass
            if (mouse.eaten >= mouseReproduceThreshold) {
                mouse.eaten = 0; // Reset counter
                newMice.push({
                    x: (mouse.x + Math.floor(Math.random() * 3) - 1 + GRID_SIZE) % GRID_SIZE,
                    y: (mouse.y + Math.floor(Math.random() * 3) - 1 + GRID_SIZE) % GRID_SIZE,
                    eaten: 0,
                    turnsSinceEating: 0
                });
            }

            newMice.push(mouse);
        }
        mice = newMice;

        // If all mice died, spawn a new one
        if (mice.length === 0) {
            mice.push({
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
                eaten: 0,
                turnsSinceEating: 0
            });
        }

        // Cats eat mice and move
        const newCats = [];
        for (const cat of cats) {
            // Increment starvation counter
            cat.turnsSinceEating += 1;

            // Check if starved
            if (cat.turnsSinceEating > starvationThreshold) {
                continue; // Dies from starvation
            }

            // Check if on a mouse - eat it (cats occupy 2x2 area)
            const mouseIdx = mice.findIndex(m =>
                m.x >= cat.x && m.x < cat.x + 2 &&
                m.y >= cat.y && m.y < cat.y + 2
            );
            if (mouseIdx !== -1) {
                const mouse = mice[mouseIdx];
                mice.splice(mouseIdx, 1);
                cat.eaten += 1;
                cat.turnsSinceEating = 0; // Reset starvation counter
                // Add blood splat at mouse position
                bloodSplats.push({ x: mouse.x, y: mouse.y, age: 0 });
            }

            // Find nearest mouse and chase it if within vision range
            if (mice.length > 0) {
                // Use center of cat's 2x2 area for distance calculation
                const catCenterX = cat.x + 0.5;
                const catCenterY = cat.y + 0.5;
                const target = findNearest(catCenterX, catCenterY, mice);
                if (target) {
                    const dx = target.x - catCenterX;
                    const dy = target.y - catCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Only chase if mouse is within vision range
                    if (distance <= visionRange) {
                        moveToward(cat, target.x, target.y, catSpeed);
                    }
                    // Otherwise cat rests (no movement)
                }
            }

            // Reproduce if eaten enough mice
            if (cat.eaten >= catReproduceThreshold) {
                cat.eaten = 0; // Reset counter
                newCats.push({
                    x: (cat.x + Math.floor(Math.random() * 3) - 1 + GRID_SIZE) % GRID_SIZE,
                    y: (cat.y + Math.floor(Math.random() * 3) - 1 + GRID_SIZE) % GRID_SIZE,
                    eaten: 0,
                    turnsSinceEating: 0
                });
            }

            newCats.push(cat);
        }
        cats = newCats;

        // If all cats died, spawn a new one
        if (cats.length === 0) {
            cats.push({
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
                eaten: 0,
                turnsSinceEating: 0
            });
        }

        // Grass spreads
        const newGrass = [];
        const grassSpreadChance = BASE_GRASS_SPREAD_CHANCE * grassGrowth;
        const grassRandomSpawnChance = BASE_GRASS_RANDOM_SPAWN_CHANCE * grassGrowth;

        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (grid[y][x] === GRASS && Math.random() < grassSpreadChance) {
                    // Try to spread to adjacent cell
                    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                    const dir = dirs[Math.floor(Math.random() * dirs.length)];
                    const nx = (x + dir[0] + GRID_SIZE) % GRID_SIZE;
                    const ny = (y + dir[1] + GRID_SIZE) % GRID_SIZE;

                    if (!grid[ny][nx]) {
                        newGrass.push({ x: nx, y: ny });
                    }
                } else if (!grid[y][x] && Math.random() < grassRandomSpawnChance) {
                    // Random grass spawning (less common)
                    newGrass.push({ x, y });
                }
            }
        }

        for (const g of newGrass) {
            grid[g.y][g.x] = GRASS;
        }

        // Age and remove old blood splats
        bloodSplats = bloodSplats.map(splat => ({ ...splat, age: splat.age + 1 }))
            .filter(splat => splat.age < 5);

        recordHistory();
        draw();
        drawChart();
    }

    function draw() {
        // Canvas size is handled by setupResponsiveCanvas
        // We just need to clear and draw using current CELL_SIZE
        const width = canvas.width / (window.devicePixelRatio || 1); // Logical width
        const height = canvas.height / (window.devicePixelRatio || 1); // Logical height

        // Clear
        ctx.fillStyle = '#f5f5dc'; // Beige background
        ctx.fillRect(0, 0, width, height);

        if (!grid || grid.length === 0) return;

        // Draw grass
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (grid[y][x] === GRASS) {
                    ctx.fillStyle = '#7cb342';
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }

        // Draw blood splats
        ctx.font = `${Math.max(10, Math.floor(CELL_SIZE * 0.8))}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (const splat of bloodSplats) {
            ctx.fillText('☠️', splat.x * CELL_SIZE + CELL_SIZE / 2, splat.y * CELL_SIZE + CELL_SIZE / 2);
        }

        // Draw mice
        for (const mouse of mice) {
            ctx.fillText('🐀', mouse.x * CELL_SIZE + CELL_SIZE / 2, mouse.y * CELL_SIZE + CELL_SIZE / 2);
        }

        // Draw cats (2x2 size)
        ctx.font = `${Math.max(16, Math.floor(CELL_SIZE * 1.6))}px Arial`;
        for (const cat of cats) {
            ctx.fillText('🐈', cat.x * CELL_SIZE + CELL_SIZE, cat.y * CELL_SIZE + CELL_SIZE);
        }
        ctx.font = '12px Arial';

        // Draw tooltip if hovering over an entity
        if (hoveredEntity) {
            const tooltipX = hoveredEntity.x * CELL_SIZE + CELL_SIZE;
            const tooltipY = hoveredEntity.y * CELL_SIZE;

            const text = `Last ate: ${hoveredEntity.turnsSinceEating} turns ago`;
            const textWidth = ctx.measureText(text).width;
            const padding = 6;
            const boxWidth = textWidth + padding * 2;
            const boxHeight = 20;

            // Draw tooltip background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(tooltipX, tooltipY, boxWidth, boxHeight);

            // Draw tooltip text
            ctx.fillStyle = '#fff';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(text, tooltipX + padding, tooltipY + 3);
        }
    }

    function drawChart() {
        // Setup canvas with proper DPI scaling
        const dpr = window.devicePixelRatio || 1;
        const rect = chartCanvas.getBoundingClientRect();
        const displayWidth = rect.width;
        const displayHeight = rect.height;

        chartCanvas.width = displayWidth * dpr;
        chartCanvas.height = displayHeight * dpr;
        chartCanvas.style.width = displayWidth + 'px';
        chartCanvas.style.height = displayHeight + 'px';

        // Reset transform and apply DPI scaling
        chartCtx.setTransform(1, 0, 0, 1, 0, 0);
        chartCtx.scale(dpr, dpr);

        const width = displayWidth;
        const height = displayHeight;
        const padding = { top: 20, right: 10, bottom: 30, left: 40 };
        const plotW = width - padding.left - padding.right;
        const plotH = height - padding.top - padding.bottom;

        chartCtx.clearRect(0, 0, width, height);

        if (history.length < 2) return;

        // Find max for scaling
        const maxGrass = Math.max(...history.map(h => h.grass));
        const maxMice = Math.max(...history.map(h => h.mice));
        const maxCats = Math.max(...history.map(h => h.cats));
        const maxVal = Math.max(maxGrass, maxMice, maxCats, 10);

        // Transform function for y-values
        const transform = useLogScale
            ? (val) => Math.log10(val + 1)
            : (val) => val;
        const maxTransformed = transform(maxVal);

        // Draw axes
        chartCtx.strokeStyle = '#666';
        chartCtx.lineWidth = 1;
        chartCtx.beginPath();
        chartCtx.moveTo(padding.left, padding.top);
        chartCtx.lineTo(padding.left, height - padding.bottom);
        chartCtx.lineTo(width - padding.right, height - padding.bottom);
        chartCtx.stroke();

        // Y-axis labels
        chartCtx.fillStyle = '#333';
        chartCtx.font = '10px sans-serif';
        chartCtx.textAlign = 'right';
        chartCtx.textBaseline = 'middle';
        for (let i = 0; i <= 4; i++) {
            const val = Math.round(maxVal * i / 4);
            const py = height - padding.bottom - (transform(val) / maxTransformed) * plotH;
            chartCtx.fillText(val, padding.left - 5, py);
        }

        // Draw lines
        const drawLine = (data, color) => {
            chartCtx.strokeStyle = color;
            chartCtx.lineWidth = 2;
            chartCtx.beginPath();

            for (let i = 0; i < history.length; i++) {
                const x = padding.left + (i / Math.max(history.length - 1, 1)) * plotW;
                const rawValue = data(history[i]);
                const y = height - padding.bottom - (transform(rawValue) / maxTransformed) * plotH;

                if (i === 0) chartCtx.moveTo(x, y);
                else chartCtx.lineTo(x, y);
            }
            chartCtx.stroke();
        };

        drawLine(h => h.grass, '#7cb342');
        drawLine(h => h.mice, '#888');
        drawLine(h => h.cats, '#ff8c42');

        // Legend
        chartCtx.font = '11px sans-serif';
        chartCtx.textAlign = 'left';

        chartCtx.fillStyle = '#7cb342';
        chartCtx.fillText('🟩 Grass', padding.left + 10, padding.top + 5);

        chartCtx.fillStyle = '#888';
        chartCtx.fillText('🐀 Mice', padding.left + 80, padding.top + 5);

        chartCtx.fillStyle = '#ff8c42';
        chartCtx.fillText('🐈 Cats', padding.left + 140, padding.top + 5);
    }

    function reset() {
        running = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        initGrid();
        draw();
        drawChart();
    }

    function runLoop() {
        if (!running) return;
        step();
        setTimeout(() => {
            animationId = requestAnimationFrame(runLoop);
        }, 100);
    }

    // Slider event handlers
    if (catSpeedSlider) {
        catSpeedSlider.addEventListener('input', () => {
            catSpeed = parseFloat(catSpeedSlider.value);
            if (catSpeedValue) catSpeedValue.textContent = catSpeed.toFixed(1);
        });
    }

    if (mouseSpeedSlider) {
        mouseSpeedSlider.addEventListener('input', () => {
            mouseSpeed = parseFloat(mouseSpeedSlider.value);
            if (mouseSpeedValue) mouseSpeedValue.textContent = mouseSpeed.toFixed(1);
        });
    }

    if (grassGrowthSlider) {
        grassGrowthSlider.addEventListener('input', () => {
            grassGrowth = parseFloat(grassGrowthSlider.value);
            if (grassGrowthValue) grassGrowthValue.textContent = grassGrowth.toFixed(1);
        });
    }

    if (visionSlider) {
        visionSlider.addEventListener('input', () => {
            visionRange = parseInt(visionSlider.value);
            if (visionValue) visionValue.textContent = visionRange;
        });
    }

    if (mouseReproduceSlider) {
        mouseReproduceSlider.addEventListener('input', () => {
            mouseReproduceThreshold = parseInt(mouseReproduceSlider.value);
            if (mouseReproduceValue) mouseReproduceValue.textContent = mouseReproduceThreshold;
        });
    }

    if (catReproduceSlider) {
        catReproduceSlider.addEventListener('input', () => {
            catReproduceThreshold = parseInt(catReproduceSlider.value);
            if (catReproduceValue) catReproduceValue.textContent = catReproduceThreshold;
        });
    }

    if (starvationSlider) {
        starvationSlider.addEventListener('input', () => {
            starvationThreshold = parseInt(starvationSlider.value);
            if (starvationValue) starvationValue.textContent = starvationThreshold;
        });
    }

    // Event handlers
    stepBtn.addEventListener('click', step);

    runBtn.addEventListener('click', () => {
        running = !running;
        if (running) {
            runBtn.textContent = 'Stop';
            runLoop();
        } else {
            runBtn.textContent = 'Run';
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
    });

    resetBtn.addEventListener('click', reset);

    if (logScaleCheckbox) {
        logScaleCheckbox.addEventListener('change', () => {
            useLogScale = logScaleCheckbox.checked;
            drawChart();
        });
    }

    // Hover detection for entities
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Convert to grid coordinates
        const gridX = Math.floor(mouseX / CELL_SIZE);
        const gridY = Math.floor(mouseY / CELL_SIZE);

        // Check if hovering over a mouse or cat
        let found = null;

        for (const mouse of mice) {
            if (mouse.x === gridX && mouse.y === gridY) {
                found = mouse;
                break;
            }
        }

        if (!found) {
            for (const cat of cats) {
                // Cats occupy a 2x2 area
                if (gridX >= cat.x && gridX < cat.x + 2 &&
                    gridY >= cat.y && gridY < cat.y + 2) {
                    found = cat;
                    break;
                }
            }
        }

        if (found !== hoveredEntity) {
            hoveredEntity = found;
            draw();
        }
    });

    canvas.addEventListener('mouseleave', () => {
        if (hoveredEntity) {
            hoveredEntity = null;
            draw();
        }
    });

    // Initialize
    reset();
}
