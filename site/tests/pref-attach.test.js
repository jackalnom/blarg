import assert from 'assert';

console.log("Running Preferential Attachment test...");

const pNew = 0.02;
const maxSteps = 50_000;
let sizes = [1];
let totalMass = 1;

// Simplified simulation for testing
for (let i = 0; i < maxSteps; i++) {
    if (Math.random() < pNew) {
        sizes.push(1);
        totalMass += 1;
    } else {
        const r = Math.random() * totalMass;
        let acc = 0;
        let picked = sizes.length - 1;
        for (let j = 0; j < sizes.length; j++) {
            acc += sizes[j];
            if (acc >= r) {
                picked = j;
                break;
            }
        }
        sizes[picked]++;
        totalMass++;
    }
}

// Count frequency of each size
const sizeCounts = {};
for (const s of sizes) {
    sizeCounts[s] = (sizeCounts[s] || 0) + 1;
}

// Check for power law property: log(count) ~ -alpha * log(size)
// We'll look at sizes 2 to 10 to avoid noise at tail and initial condition at 1
const x = [];
const y = [];
for (let s = 2; s <= 10; s++) {
    if (sizeCounts[s]) {
        x.push(Math.log(s));
        y.push(Math.log(sizeCounts[s]));
    }
}

// Linear regression
let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
const n = x.length;
for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
}

const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
console.log(`Power law slope (alpha): ${-slope.toFixed(3)}`);

// Theoretical exponent for this BA model variant is often around 2-3 depending on exact mechanics
// We just want to confirm it IS a power law (negative slope) and roughly in range
assert(slope < -1.5 && slope > -4.0, `Slope ${slope} is not in expected power law range (-1.5 to -4.0)`);

console.log("Preferential Attachment test passed.");
