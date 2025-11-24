export function lnStats(sides) {
    let mean = 0;
    for (let k = 1; k <= sides; k++) mean += Math.log(k);
    mean /= sides;
    let v = 0;
    for (let k = 1; k <= sides; k++) {
        const d = Math.log(k) - mean;
        v += d * d;
    }
    v /= sides;
    return { mean, var: v };
}

export function catmull(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

export function valueAt(points, t) {
    const n = points.length;
    if (n === 0) return 0;
    if (t <= points[0].x) return points[0].y;
    if (t >= points[n - 1].x) return points[n - 1].y;
    let i = 0;
    while (i < n - 1 && points[i + 1].x < t) i++;
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[Math.min(n - 1, i + 1)];
    const p3 = points[Math.min(n - 1, i + 2)];
    const span = p2.x - p1.x || 1e-6;
    const localT = (t - p1.x) / span;
    const y = catmull(p0.y, p1.y, p2.y, p3.y, localT);
    return Math.max(0, Math.min(1, y));
}
