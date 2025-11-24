import assert from 'assert';

function sumDice(n, sides) {
    let s = 0;
    for (let i = 0; i < n; i++) s += Math.floor(Math.random() * sides) + 1;
    return s;
}

console.log("Running CLT distribution test...");

const diceCount = 5;
const dieSides = 6;
const samples = 100_000;
let sum = 0;
let sumSq = 0;

for (let i = 0; i < samples; i++) {
    const val = sumDice(diceCount, dieSides);
    sum += val;
    sumSq += val * val;
}

const mean = sum / samples;
const variance = (sumSq / samples) - (mean * mean);
const stdDev = Math.sqrt(variance);

// Theoretical values for sum of n uniform discrete variables (1..k)
// Mean of one die = (k+1)/2
// Variance of one die = (k^2 - 1)/12
const theoreticalMean = diceCount * (dieSides + 1) / 2;
const theoreticalVariance = diceCount * (dieSides * dieSides - 1) / 12;
const theoreticalStdDev = Math.sqrt(theoreticalVariance);

console.log(`Mean: ${mean.toFixed(3)} (Expected: ${theoreticalMean})`);
console.log(`StdDev: ${stdDev.toFixed(3)} (Expected: ${theoreticalStdDev.toFixed(3)})`);

assert(Math.abs(mean - theoreticalMean) < 0.1, `Mean ${mean} deviates too much from expected ${theoreticalMean}`);
assert(Math.abs(stdDev - theoreticalStdDev) < 0.1, `StdDev ${stdDev} deviates too much from expected ${theoreticalStdDev}`);

console.log("CLT distribution test passed.");
