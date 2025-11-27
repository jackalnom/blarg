/**
 * Statistical utility functions
 */

/**
 * Box-Muller transform for normal distribution
 * @returns {number} Random number from standard normal distribution
 */
export function randn() {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Calculate Pearson correlation coefficient
 * @param {number[]} x - Array of x values
 * @param {number[]} y - Array of y values
 * @returns {number} Correlation coefficient (-1 to 1)
 */
export function correlation(x, y) {
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

/**
 * Calculate linear regression (Least Squares)
 * @param {number[]} x - Array of x values
 * @param {number[]} y - Array of y values
 * @returns {object} { slope, intercept, r2 }
 */
export function linearRegression(x, y) {
    const n = x.length;
    if (n === 0) return { slope: 0, intercept: 0, r2: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumXX += x[i] * x[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R²
    let ssTot = 0, ssRes = 0;
    const meanY = sumY / n;
    for (let i = 0; i < n; i++) {
        const predicted = slope * x[i] + intercept;
        ssTot += Math.pow(y[i] - meanY, 2);
        ssRes += Math.pow(y[i] - predicted, 2);
    }
    const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

    return { slope, intercept, r2 };
}
