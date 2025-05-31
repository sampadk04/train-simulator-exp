// Utility functions for the simulation
export function validateConfiguration(config) {
    const errors = [];
    
    if (!config.TRACK || config.TRACK.RADIUS <= 0) {
        errors.push("Invalid track radius");
    }
    
    if (!config.TRAIN || config.TRAIN.MIN_COMPARTMENTS < 1) {
        errors.push("Invalid minimum compartments");
    }
    
    if (config.TRAIN && config.TRAIN.MAX_COMPARTMENTS < config.TRAIN.MIN_COMPARTMENTS) {
        errors.push("Max compartments must be >= min compartments");
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

export function formatSpeed(speed, baseSpeed = 0.001) {
    return (speed / baseSpeed).toFixed(1) + 'x';
}