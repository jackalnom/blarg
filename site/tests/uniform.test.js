import assert from 'assert';

// Simple chi-squared test for uniformity
function chiSquaredUniform(counts, expectedCount) {
    let chi2 = 0;
    for (const count of counts) {
        chi2 += Math.pow(count - expectedCount, 2) / expectedCount;
    }
    return chi2;
}

// Simulate uniform distribution
function simulateUniform(bins, samples) {
    const counts = new Array(bins).fill(0);
    for (let i = 0; i < samples; i++) {
        const idx = Math.floor(Math.random() * bins);
        counts[idx]++;
    }
    return counts;
}

console.log("Running uniform distribution test...");

const bins = 100;
const samples = 100_000;
const expectedPerBin = samples / bins;
const counts = simulateUniform(bins, samples);
const chi2 = chiSquaredUniform(counts, expectedPerBin);

// Degrees of freedom = bins - 1 = 99
// Critical value for p=0.01 is approx 135.8
// Critical value for p=0.05 is approx 124.3
// We'll use a generous threshold to avoid flakiness, but enough to catch broken RNG
const criticalValue = 160;

console.log(`Chi-squared: ${chi2.toFixed(2)} (Threshold: ${criticalValue})`);

assert(chi2 < criticalValue, `Chi-squared value ${chi2} exceeds threshold ${criticalValue}, distribution may not be uniform.`);

console.log("Uniform distribution test passed.");
