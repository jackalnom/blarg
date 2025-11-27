# Visualization Code Analysis & Refactoring Strategy

**Recent Cleanup (Completed):**
- ✅ Removed `ice-cream-murder.js` - Redundant with DAG visualization
- ✅ Removed `city-population.js` references - File never existed
- ✅ Removed `uniform.js` - Only used in draft test page

---

## Section 1: Current State Analysis

### Visualization Categories

#### Interactive Simulations (Step/Run/Reset)
1. **dag.js** (453 lines)
   - Purpose: Causal graph visualization showing how variables influence each other
   - Features: Interactive DAG diagram + scatterplot, correlation analysis, adjustable edge weights
   - Controls: Step, Run, Reset, weight sliders

2. **berkson-paradox.js** (434 lines)
   - Purpose: Demonstrates selection bias creating inverse correlation
   - Features: DAG diagram + 2 scatterplots (all data vs selected), threshold slider
   - Controls: Step, Run, Reset, threshold slider

3. **diminishing-returns.js** (279 lines)
   - Purpose: Shows non-linear relationship with logarithmic utility
   - Features: Single scatterplot with linear expectation line
   - Controls: Step, Run, Reset, exponent slider

4. **ecosystem.js** (684 lines)
   - Purpose: Predator-prey simulation (cats, mice, grass)
   - Features: Grid simulation + population chart
   - Controls: Step, Run, Reset, 7 parameter sliders, log scale checkbox
   - Uses: `setupResponsiveCanvas` from simulation.js

5. **boids.js** (327 lines)
   - Purpose: Flocking behavior simulation
   - Features: Continuous animation (no step/run controls)
   - Controls: Reset, 4 parameter sliders (separation, alignment, cohesion, count)
   - No Step/Run buttons - always running

#### Static Data Visualizations (No controls)
6. **seasonality.js** (398 lines)
   - Purpose: Interactive seasonality decomposition (weekly, annual, trend)
   - Features: 3 draggable control charts + combined output, noise slider
   - No Step/Run/Reset - drag to edit

7. **height-distribution.js** (296 lines)
   - Purpose: Human height distribution from NHANES data
   - Features: Static histogram with gender split toggle
   - Controls: Checkbox to split by gender

8. **electricity-demand.js** (299 lines)
   - Purpose: California electricity demand time series
   - Features: Line chart with hover tooltips
   - Controls: None (hover interaction only)

9. **home-values.js** (229 lines)
   - Purpose: Milwaukee home sale prices histogram
   - Features: Static histogram with log scale toggle
   - Controls: Log scale checkbox

10. **steam-reviews.js** (194 lines)
    - Purpose: Steam game review counts (power-law distribution)
    - Features: Static histogram with log scale toggle
    - Controls: Log scale checkbox

#### Sample Generator Visualizations (Uses simulation.js framework)
11. **clt.js** (44 lines)
    - Uses: StandardSimulation class
    - Purpose: Central Limit Theorem demonstration

12. **lognormal.js** (72 lines)
    - Uses: StandardSimulation class
    - Purpose: Log-normal distribution generator

13. **sigmoid.js** (51 lines)
    - Uses: StandardSimulation class
    - Purpose: Cumulative distribution (sigmoid) generator

14. **pref-attach.js** (135 lines)
    - Uses: StandardSimulation class
    - Purpose: Preferential attachment network growth

---

## Section 2: Identified Redundancies

### 2.1 Canvas Setup Pattern (HIGHLY DUPLICATED)

**setupCanvas() function duplicated in 6 files:**

**dag.js** (lines 175-191):
```javascript
function setupCanvas(canvas, aspectRatio) {
    const dpr = window.devicePixelRatio || 1;
    const container = canvas.parentElement;
    const displayWidth = container.clientWidth;
    const displayHeight = Math.round(displayWidth / aspectRatio);

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    return { width: displayWidth, height: displayHeight };
}
```

**Identical implementations in:**
- berkson-paradox.js (lines 82-98)
- diminishing-returns.js (lines 89-104)
- seasonality.js (lines 135-151)
- electricity-demand.js (lines 67-83)
- height-distribution.js (lines 66-79 - slight variation)
- home-values.js (lines 37-50 - slight variation)
- steam-reviews.js (lines 35-47 - slight variation)

**Already abstracted in:**
- simulation.js has `setupResponsiveCanvas()` (lines 10-47) - more sophisticated version with callbacks
- Used by: ecosystem.js, all sample generators (uniform, clt, lognormal, etc.)

---

### 2.2 Axis Drawing Code (DUPLICATED)

**X/Y axis drawing with labels and ticks appears in:**

**dag.js** (lines 316-344):
```javascript
// Draw axes
ctx.strokeStyle = colors.fg2;
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(padding.left, padding.top);
ctx.lineTo(padding.left, height - padding.bottom);
ctx.lineTo(width - padding.right, height - padding.bottom);
ctx.stroke();

// X-axis label
ctx.fillStyle = colors.fg;
ctx.font = '12px sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'top';
ctx.fillText(xLabel, padding.left + plotW / 2, height - padding.bottom + 25);

// Y-axis label (rotated)
ctx.save();
ctx.translate(15, padding.top + plotH / 2);
ctx.rotate(-Math.PI / 2);
ctx.textAlign = 'center';
ctx.textBaseline = 'top';
ctx.fillText(yLabel, 0, 0);
ctx.restore();
```

**Similar patterns in:**
- berkson-paradox.js (lines 214-256)
- diminishing-returns.js (lines 139-181)
- ecosystem.js (lines 456-484) - chart drawing
- height-distribution.js (lines 116-151)
- electricity-demand.js (lines 105-137)
- home-values.js (lines 84-132)
- steam-reviews.js (lines 98-160)

**Each has slight variations but follows same pattern:**
1. Draw L-shaped axes
2. Draw tick marks
3. Draw tick labels
4. Draw axis labels (X horizontal, Y rotated)
5. Optional: grid lines

---

### 2.3 Linear Regression (DUPLICATED)

**dag.js** (lines 358-367):
```javascript
let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
for (let i = 0; i < n; i++) {
    sumX += xData[i];
    sumY += yData[i];
    sumXY += xData[i] * yData[i];
    sumX2 += xData[i] * xData[i];
}
const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
const intercept = (sumY - slope * sumX) / n;
```

**berkson-paradox.js** (lines 63-77):
```javascript
function linearRegression(points) {
    const n = points.length;
    if (n === 0) return { slope: 0, intercept: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (const p of points) {
        sumX += p.location;
        sumY += p.taste;
        sumXY += p.location * p.taste;
        sumXX += p.location * p.location;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}
```

**Two slightly different implementations for same algorithm!**

---

### 2.4 Correlation Calculation (DUPLICATED)

**dag.js** (lines 104-122):
```javascript
function correlation(x, y) {
    const n = x.length;
    if (n < 2) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let num = 0, denomX = 0, denomY = 0;
    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        num += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
    }

    const denom = Math.sqrt(denomX * denomY);
    return denom > 0 ? num / denom : 0;
}
```

**Used in dag.js but also implicit in berkson-paradox.js R² calculation (lines 340-351)**

---

### 2.5 Button/Control Handling (SIMILAR PATTERNS)

**Step button pattern:**
- dag.js (lines 403-407)
- berkson-paradox.js (line 394)
- diminishing-returns.js (line 230)
- ecosystem.js (line 600)

**Run/Stop toggle pattern:**
- dag.js (lines 409-423)
- berkson-paradox.js (lines 396-408)
- diminishing-returns.js (lines 232-245)
- ecosystem.js (lines 602-614)

**Reset pattern:**
- dag.js (lines 91-102, 425-427)
- berkson-paradox.js (lines 29-39, 410)
- diminishing-returns.js (lines 26-35, 247)
- ecosystem.js (lines 521-530, 616)

**All follow similar structure but with different state variables and drawing functions**

---

### 2.6 Animation Loop Pattern (DUPLICATED)

**dag.js** (lines 395-401):
```javascript
function runLoop() {
    if (!isRunning) return;
    generateSamples(10); // Add 10 samples per frame
    setTimeout(() => {
        animationId = requestAnimationFrame(runLoop);
    }, 100);
}
```

**berkson-paradox.js** (lines 385-391):
```javascript
function runLoop() {
    if (!running) return;
    step();
    setTimeout(() => {
        animationId = requestAnimationFrame(runLoop);
    }, 200);
}
```

**diminishing-returns.js** (lines 221-227):
```javascript
function runLoop() {
    if (!running) return;
    step();
    setTimeout(() => {
        animationId = requestAnimationFrame(runLoop);
    }, 200);
}
```

**ecosystem.js** (lines 532-538):
```javascript
function runLoop() {
    if (!running) return;
    step();
    setTimeout(() => {
        animationId = requestAnimationFrame(runLoop);
    }, 100);
}
```

**All use same pattern: check flag, step, setTimeout + requestAnimationFrame**

---

### 2.7 Resize Handling (DUPLICATED)

**dag.js** (lines 429-436):
```javascript
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        drawDAG();
        drawScatter();
    }, 100);
});
```

**Similar in:**
- berkson-paradox.js (direct draw call)
- diminishing-returns.js (line 268)
- seasonality.js (lines 385-389)
- boids.js (lines 318-320)
- height-distribution.js (lines 284-288)
- electricity-demand.js (lines 261-265)
- home-values.js (lines 217-221)
- steam-reviews.js (line 192)

**All use debounced resize with 100ms timeout**

---

### 2.8 Theme Change Handling (CONSISTENT)

**Already well-abstracted! All files use:**
```javascript
listenForThemeChange(() => {
    // redraw
});
```

**From utils.js (lines 146-165)**
- This is a good example of successful abstraction
- No duplication here

---

### 2.9 Scatterplot Drawing (DUPLICATED)

**dag.js** has `drawScatterplot()` (lines 283-393)**
- Draws axes, padding, data points, regression line, R² display
- 110 lines of code

**berkson-paradox.js** has `drawScatterplot()` (lines 183-377)**
- Very similar structure: axes, padding, points, regression, R²
- Additional features: selection region shading, threshold line
- 194 lines of code

**Both could share 60-70% of their code**

---

### 2.10 Random Normal Generator (DUPLICATED)

**dag.js** (lines 39-43):
```javascript
function randn() {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
```

**Used only in dag.js, but Box-Muller transform is a common utility**

---

### 2.11 Slider Update Pattern (DUPLICATED)

**boids.js** (lines 254-258, repeated for each slider):
```javascript
function updateSliderValue(slider, valueEl) {
    if (slider && valueEl) {
        valueEl.textContent = parseFloat(slider.value).toFixed(1);
    }
}
```

**Similar patterns in:**
- ecosystem.js (lines 541-597) - inline for each slider
- diminishing-returns.js (lines 249-266)
- berkson-paradox.js (lines 412-422)
- dag.js (lines 158-170)

**Could be abstracted to a generic slider binding utility**

---

## Section 3: Abstraction Opportunities

### 3.1 Core Canvas Utilities

**Opportunity:** Create `canvas-utils.js` with shared canvas operations

**Functions to extract:**

1. **setupCanvas(canvas, aspectRatio)** ✅
   - Already exists in simulation.js as `setupResponsiveCanvas()`
   - Should be moved to utils.js for wider use
   - Currently duplicated in 8+ files

2. **drawAxes(ctx, padding, width, height, options)**
   - Options: { xLabel, yLabel, xTicks, yTicks, grid }
   - Eliminate 200+ lines of duplicated axis code

3. **drawGrid(ctx, padding, width, height, xTicks, yTicks)**
   - Grid line drawing abstracted

4. **scaleToCanvas(value, range, padding, dimension)**
   - Generic coordinate transformation

---

### 3.2 Statistical Utilities

**Opportunity:** Create `stats.js` for mathematical operations

**Functions to extract:**

1. **linearRegression(xData, yData)** ✅
   - Return: { slope, intercept }
   - Used in: dag.js, berkson-paradox.js

2. **correlation(xArray, yArray)** ✅
   - Return: correlation coefficient
   - Used in: dag.js

3. **rSquared(xData, yData, slope, intercept)** ✅
   - Calculate coefficient of determination
   - Currently inline in berkson-paradox.js

4. **randn()** - Box-Muller transform ✅
   - Normal random number generator
   - Used in: dag.js

---

### 3.3 Interactive Control Framework

**Opportunity:** Create `controls.js` for button/slider management

**Classes to create:**

1. **SimulationController**
   ```javascript
   class SimulationController {
       constructor({ stepBtn, runBtn, resetBtn, onStep, onReset }) {
           this.running = false;
           this.animationId = null;
           // Unified button binding
       }

       step(count = 10) { /* ... */ }

       start(delay = 100) {
           // Unified run loop with configurable delay
       }

       stop() { /* ... */ }

       reset() { /* ... */ }
   }
   ```

   **Would eliminate:**
   - 4 copies of runLoop() pattern
   - 4 copies of start/stop toggle logic
   - 4 copies of reset logic
   - ~80 lines of duplicated code per file

2. **SliderBinding**
   ```javascript
   function bindSlider(sliderId, valueId, onChange, formatter = (v) => v.toFixed(1)) {
       const slider = document.getElementById(sliderId);
       const display = document.getElementById(valueId);
       // Unified event binding + display update
   }
   ```

   **Would eliminate:**
   - Duplicated slider binding in 5+ files
   - ~15 lines per slider × 20+ sliders = 300 lines

---

### 3.4 Scatterplot Renderer

**Opportunity:** Create reusable scatterplot component

**API Design:**
```javascript
class ScatterplotRenderer {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.config = { padding, width, height, ...config };
    }

    draw(xData, yData, options = {}) {
        // options: {
        //   showRegression,
        //   showR2,
        //   pointColor,
        //   regressionColor,
        //   xLabel,
        //   yLabel,
        //   overlay: (ctx) => { /* custom drawing */ }
        // }
    }
}
```

**Would eliminate:**
- ~150 lines in dag.js
- ~180 lines in berkson-paradox.js
- Shared by any future scatterplot needs

---

### 3.5 Chart Axis Generator

**Opportunity:** Smart axis tick generation

**Functions:**
```javascript
function generateTicks(min, max, targetCount = 5, mode = 'linear') {
    // Returns nice tick values for linear or log scales
    // Used by: all 10 visualization files
}

function formatTickLabel(value, options = {}) {
    // options: { format: 'number' | 'currency' | 'date', decimals, prefix, suffix }
}
```

**Currently:**
- Every file manually generates tick positions
- Inconsistent formatting (some use 'k', 'M', some don't)
- Log scale tick generation duplicated 3 times

---

### 3.6 Resize Handler Utility

**Opportunity:** Unified resize management

**API:**
```javascript
function onResize(callback, debounceMs = 100) {
    let timeout;
    window.addEventListener('resize', () => {
        clearTimeout(timeout);
        timeout = setTimeout(callback, debounceMs);
    });
}
```

**Would eliminate:**
- 10 copies of identical resize debouncing
- ~5 lines per file = 50 lines total

---

### 3.7 Tooltip Renderer

**Opportunity:** Reusable hover tooltip

**Currently:**
- ecosystem.js has custom hover (lines 635-677)
- electricity-demand.js has custom hover (lines 268-293)
- Each implements from scratch

**API:**
```javascript
class TooltipRenderer {
    constructor(canvas, getDataAtPoint) {
        // Manages hover state, tooltip positioning
    }

    show(x, y, content) {
        // Draws tooltip box with smart positioning
    }
}
```

---

### 3.8 Already Well-Abstracted Components

**These are good examples to learn from:**

1. **simulation.js** - Excellent abstraction
   - `StandardSimulation` class
   - `SimulationRunner` class
   - Used by 5 sample generators
   - Eliminates 90% of boilerplate

2. **utils.js** - Good shared utilities
   - `getThemeColors()` - used by all files
   - `listenForThemeChange()` - used by all files
   - `makeBarLayout()` - used by simulation files

3. **constants.js** - Centralized config
   - LAYOUT, DEFAULTS, COLORS, STYLE
   - Single source of truth

---

## Section 4: Proposed Refactoring Strategy

### Phase 1: Extract Low-Hanging Fruit (Week 1)

**Goal:** Extract commonly-used utilities without breaking existing code

**Tasks:**

1. **Create `canvas-utils.js`**
   ```javascript
   // Export setupCanvas (copy from simulation.js)
   export function setupCanvas(canvas, aspectRatio) { /* ... */ }

   // Export resize handler
   export function onResize(callback, debounceMs = 100) { /* ... */ }
   ```

   **Files to update:** 8 files
   **Lines saved:** ~120 lines

2. **Create `stats.js`**
   ```javascript
   export function linearRegression(xData, yData) { /* ... */ }
   export function correlation(xArray, yArray) { /* ... */ }
   export function rSquared(xData, yData, slope, intercept) { /* ... */ }
   export function randn() { /* ... */ } // Box-Muller
   ```

   **Files to update:** dag.js, berkson-paradox.js
   **Lines saved:** ~40 lines

3. **Move `setupResponsiveCanvas` from simulation.js to utils.js**
   - Make it available to all visualizations
   - Update imports in 6 files

**Risk:** Low - These are pure functions with no side effects

**Testing:** Visual regression testing - ensure all charts still render correctly

---

### Phase 2: Create Axis Rendering System (Week 2)

**Goal:** Eliminate duplicated axis drawing code

**Tasks:**

1. **Create `axis-renderer.js`**
   ```javascript
   export class AxisRenderer {
       constructor(ctx, config) {
           this.ctx = ctx;
           this.config = config; // padding, width, height
       }

       drawXAxis(options) {
           // options: { min, max, label, ticks, grid }
       }

       drawYAxis(options) {
           // options: { min, max, label, ticks, grid, rotated }
       }

       generateTicks(min, max, count, mode) {
           // Smart tick generation (linear, log, date)
       }
   }
   ```

2. **Update files to use AxisRenderer:**
   - Phase 2a: dag.js, berkson-paradox.js, diminishing-returns.js
   - Phase 2b: ecosystem.js, height-distribution.js, electricity-demand.js
   - Phase 2c: home-values.js, steam-reviews.js

**Lines saved:** ~200 lines across 8 files

**Risk:** Medium - Requires careful testing of edge cases (log scales, date formatting)

---

### Phase 3: Create Control Framework (Week 3)

**Goal:** Standardize Step/Run/Reset controls

**Tasks:**

1. **Create `simulation-controller.js`**
   ```javascript
   export class SimulationController {
       constructor(config) {
           // config: { stepBtn, runBtn, resetBtn, onStep, onReset, stepDelay }
       }

       // Unified control logic
   }
   ```

2. **Update interactive simulations:**
   - dag.js
   - berkson-paradox.js
   - diminishing-returns.js
   - ecosystem.js

**Lines saved:** ~80 lines per file × 4 files = 320 lines

**Risk:** Medium - Each file has slight variations in behavior

**Strategy:** Start with dag.js as pilot, then generalize

---

### Phase 4: Create Scatterplot Component (Week 4)

**Goal:** Reusable scatterplot renderer

**Tasks:**

1. **Create `scatterplot-renderer.js`**
   ```javascript
   export class ScatterplotRenderer {
       constructor(ctx, config) { /* ... */ }

       draw(xData, yData, options) {
           // Handles: axes, points, regression, R², custom overlays
       }

       drawRegression(xData, yData, color) { /* ... */ }

       drawPoints(xData, yData, options) { /* ... */ }
   }
   ```

2. **Update files:**
   - dag.js (drawScatterplot → use ScatterplotRenderer)
   - berkson-paradox.js (drawScatterplot → use ScatterplotRenderer + custom overlay)

**Lines saved:** ~250 lines across 2 files

**Risk:** Low-Medium - Scatterplot patterns are similar

---

### Phase 5: Create Tooltip System (Week 5)

**Goal:** Reusable hover tooltips

**Tasks:**

1. **Create `tooltip-renderer.js`**
   ```javascript
   export class TooltipRenderer {
       constructor(canvas) { /* ... */ }

       attach(getDataAtPoint, formatContent) {
           // Handles mousemove, mouseleave events
       }

       show(x, y, content) {
           // Smart positioning, avoiding edges
       }
   }
   ```

2. **Update files:**
   - ecosystem.js
   - electricity-demand.js

**Lines saved:** ~80 lines

**Risk:** Low - Tooltip is isolated feature

---

### Phase 6: Create Slider Binding Utility (Week 6)

**Goal:** Eliminate repetitive slider code

**Tasks:**

1. **Add to `utils.js`:**
   ```javascript
   export function bindSlider(sliderId, valueId, onChange, options = {}) {
       // options: { format: (v) => v.toFixed(1), unit: '' }
   }
   ```

2. **Update files with many sliders:**
   - ecosystem.js (7 sliders)
   - boids.js (4 sliders)
   - berkson-paradox.js (1 slider)
   - diminishing-returns.js (1 slider)
   - dag.js (dynamic weight sliders)

**Lines saved:** ~10 lines per slider × 15 sliders = 150 lines

**Risk:** Very Low - Simple utility function

---

### Phase 7: Documentation & Testing (Week 7)

**Goal:** Ensure quality and maintainability

**Tasks:**

1. **Create `visualization-guide.md`**
   - How to create new visualizations
   - Which utilities to use for common tasks
   - Examples of each component

2. **Add JSDoc comments** to all new utilities

3. **Create visual regression tests**
   - Screenshot each visualization before/after
   - Compare pixel-by-pixel or checksum

4. **Performance testing**
   - Ensure abstractions don't slow down animations
   - Profile memory usage

---

## Summary: Expected Impact

### Code Reduction
- **Before:** ~4,660 lines across 14 visualization files (after removing unused uniform.js)
- **After refactoring:** ~3,160 lines
- **Reduction:** ~1,500 lines (32% smaller)

### Files Created
1. `canvas-utils.js` (~100 lines)
2. `stats.js` (~80 lines)
3. `axis-renderer.js` (~150 lines)
4. `simulation-controller.js` (~120 lines)
5. `scatterplot-renderer.js` (~200 lines)
6. `tooltip-renderer.js` (~80 lines)

**Total new utility code:** ~730 lines

**Net reduction:** 1,500 - 730 = **770 lines eliminated**

### Maintainability Improvements
- **Bug fixes** in one place benefit all visualizations
- **Consistent behavior** across all charts (resize, theme, controls)
- **Faster development** of new visualizations (2-3x faster)
- **Easier onboarding** for new contributors

### Risk Mitigation
- Phased approach allows testing after each change
- Start with low-risk extractions (pure functions)
- Visual regression testing catches rendering bugs
- Can pause/rollback at any phase

---

## Appendix: Detailed Line References

### setupCanvas Duplication
- dag.js: 175-191 (17 lines)
- berkson-paradox.js: 82-98 (17 lines)
- diminishing-returns.js: 89-104 (16 lines)
- seasonality.js: 135-151 (17 lines)
- electricity-demand.js: 67-83 (17 lines)
- height-distribution.js: 66-79 (14 lines)
- home-values.js: 37-50 (14 lines)
- steam-reviews.js: 35-47 (13 lines)

**Total duplicated:** ~125 lines

### Axis Drawing Duplication
- dag.js: 316-344 (~29 lines for axes + labels)
- berkson-paradox.js: 214-256 (~43 lines)
- diminishing-returns.js: 139-181 (~43 lines)
- height-distribution.js: 116-151 (~36 lines)
- electricity-demand.js: 105-137 (~33 lines)
- home-values.js: 84-132 (~49 lines)
- steam-reviews.js: 98-160 (~63 lines)
- ecosystem.js: 456-484 (~29 lines)

**Total duplicated:** ~325 lines

### RunLoop Duplication
- dag.js: 395-401 (7 lines)
- berkson-paradox.js: 385-391 (7 lines)
- diminishing-returns.js: 221-227 (7 lines)
- ecosystem.js: 532-538 (7 lines)

**Total duplicated:** ~28 lines (but 4 copies means maintaining same logic in 4 places)

### Linear Regression Duplication
- dag.js: 358-367 (10 lines inline)
- berkson-paradox.js: 63-77 (15 lines as function)

**Total duplicated:** ~25 lines (2 slightly different implementations!)
