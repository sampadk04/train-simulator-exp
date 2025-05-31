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

export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
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

// Object pooling for frequently created/destroyed objects
export class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.activeObjects = new Set();
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    get() {
        let obj = this.pool.pop();
        if (!obj) {
            obj = this.createFn();
        }
        this.activeObjects.add(obj);
        return obj;
    }

    release(obj) {
        if (this.activeObjects.has(obj)) {
            this.activeObjects.delete(obj);
            if (this.resetFn) {
                this.resetFn(obj);
            }
            this.pool.push(obj);
        }
    }

    clear() {
        this.pool.length = 0;
        this.activeObjects.clear();
    }
}

// Memory management utilities
export function disposeObject3D(obj) {
    if (!obj) return;
    
    // Dispose geometry
    if (obj.geometry) {
        obj.geometry.dispose();
    }
    
    // Dispose material(s)
    if (obj.material) {
        if (Array.isArray(obj.material)) {
            obj.material.forEach(material => material.dispose());
        } else {
            obj.material.dispose();
        }
    }
    
    // Dispose texture(s)
    if (obj.material && obj.material.map) {
        obj.material.map.dispose();
    }
    
    // Remove from parent
    if (obj.parent) {
        obj.parent.remove(obj);
    }
    
    // Clear children recursively
    while (obj.children.length > 0) {
        disposeObject3D(obj.children[0]);
    }
}

// Performance monitoring
export class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.fpsHistory = [];
        this.maxHistory = 60;
    }

    update() {
        this.frameCount++;
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / deltaTime);
            this.fpsHistory.push(this.fps);
            
            if (this.fpsHistory.length > this.maxHistory) {
                this.fpsHistory.shift();
            }
            
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    getAverageFPS() {
        if (this.fpsHistory.length === 0) return 60;
        return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    }

    getFPS() {
        return this.fps;
    }

    isPerformanceLow() {
        return this.getAverageFPS() < 30;
    }
}

// Cached trigonometric calculations
export class TrigCache {
    constructor(resolution = 360) {
        this.resolution = resolution;
        this.sinCache = new Array(resolution);
        this.cosCache = new Array(resolution);
        
        for (let i = 0; i < resolution; i++) {
            const angle = (i / resolution) * 2 * Math.PI;
            this.sinCache[i] = Math.sin(angle);
            this.cosCache[i] = Math.cos(angle);
        }
    }

    sin(normalizedAngle) {
        const index = Math.floor(normalizedAngle * this.resolution) % this.resolution;
        return this.sinCache[index];
    }

    cos(normalizedAngle) {
        const index = Math.floor(normalizedAngle * this.resolution) % this.resolution;
        return this.cosCache[index];
    }
}

export const trigCache = new TrigCache();