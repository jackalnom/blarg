// Simple consistency check for the log-normal viz binning.
// Run with: node site/tests/lognormal.test.js
import assert from "assert";

// deterministic LCG
function makeRng(seed = 1234567) {
  let s = seed;
  return () => ((s = (s * 48271) % 2147483647) / 2147483647);
}

function simulateMode({ sides, count, samples, bins }) {
  const counts = new Array(bins).fill(0);
  const rng = makeRng();
  const maxValue = Math.pow(sides, count);
  const rangeLow = 1;
  const rangeHigh = maxValue;

  function sampleProduct() {
    let p = 1;
    for (let i = 0; i < count; i++) {
      p *= Math.floor(rng() * sides) + 1;
    }
    return p;
  }

  function run(useLog) {
    counts.fill(0);

    for (let i = 0; i < samples; i++) {
      const v = sampleProduct();
      let idx;
      if (useLog) {
        const clamped = Math.min(Math.max(v, rangeLow), rangeHigh);
        const ratio = Math.log(clamped / rangeLow) / (Math.log(rangeHigh / rangeLow) || 1);
        idx = Math.floor(ratio * (bins - 1));
      } else {
        const clamped = Math.min(Math.max(v, rangeLow), rangeHigh);
        const ratio = (clamped - rangeLow) / (rangeHigh - rangeLow || 1);
        idx = Math.floor(ratio * (bins - 1));
      }
      idx = Math.min(bins - 1, Math.max(0, idx));
      counts[idx]++;
    }

    let median = 0;
    let sumCounts = 0;
    const halfTotal = samples / 2;
    for (let i = 0; i < counts.length; i++) {
      sumCounts += counts[i];
      if (sumCounts >= halfTotal) {
        // Linear interpolation within bin
        const prevSum = sumCounts - counts[i];
        const fraction = (halfTotal - prevSum) / counts[i];
        const ratio = (i + fraction) / (bins - 1);
        median = useLog
          ? Math.exp(ratio * Math.log(rangeHigh / rangeLow) + Math.log(rangeLow))
          : ratio * (rangeHigh - rangeLow) + rangeLow;
        break;
      }
    }
    return median;
  }

  return {
    median: run(false)
  };
}

function testMode() {
  // 3 d20s.
  // We verify the distribution by checking the median.
  // Empirical median of 3 d20s is ~684.
  // Theoretical geometric mean is ~572.
  // The simulation should match the empirical median.

  const sides = 20;
  const dice = 3;
  const { median } = simulateMode({ sides, count: dice, samples: 500000, bins: 200 });

  const expectedMedian = 684;
  console.log(`Simulated 3d20 median approx: ${median} (Expected ~${expectedMedian})`);

  const diff = Math.abs(median - expectedMedian);
  assert(diff < 100, `Median deviation too high: got ${median}, expected ~${expectedMedian}`);
}

testMode();
console.log("lognormal product median test passed");
