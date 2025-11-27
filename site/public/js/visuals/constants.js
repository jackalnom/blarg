// Shared constants for visualization modules

export const LAYOUT = {
    leftPadding: 15,
    bottomPadding: 15,
    defaultAspectRatio: 2.5
};

export const DEFAULTS = {
    blockPx: 6,
    blockValue: 200,
    samplesPerFrame: 100,
    bins: 100
};

export const COLORS = {
    // Base hues for different visualization types
    uniform: 210,      // Blue
    clt: 140,          // Green
    lognormal: 28,     // Orange
    sigmoid: 340,      // Pink/Magenta
    prefAttach: 338,   // Pink
    seasonality: {
        daily: 210,
        weekly: 28,
        annual: 120,
        trend: 200,
        combined: 260
    },
    dag: {
        node: '#4A90E2',
        nodeBorder: '#2E5C8A',
        edge: '#666',
        point: 'rgba(74, 144, 226, 0.5)'
    }
};

export const STYLE = {
    lineWidth: 5,
    shadowBlur: 3,
    nodeRadius: 18,
    plotSize: 120,
    font: {
        small: '11px system-ui, -apple-system, sans-serif',
        medium: '12px sans-serif',
        large: '14px sans-serif',
        label: '16px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    }
};
