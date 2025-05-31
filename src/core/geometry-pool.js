// Geometry pooling system for performance optimization
export class GeometryPool {
    constructor() {
        this.geometries = new Map();
        this.refCounts = new Map();
    }

    getGeometry(type, ...args) {
        const key = `${type}_${JSON.stringify(args)}`;
        
        if (this.geometries.has(key)) {
            this.refCounts.set(key, this.refCounts.get(key) + 1);
            return this.geometries.get(key);
        }

        const geometry = new THREE[type](...args);
        this.geometries.set(key, geometry);
        this.refCounts.set(key, 1);
        return geometry;
    }

    releaseGeometry(type, ...args) {
        const key = `${type}_${JSON.stringify(args)}`;
        
        if (this.refCounts.has(key)) {
            const count = this.refCounts.get(key) - 1;
            this.refCounts.set(key, count);
            
            if (count <= 0) {
                const geometry = this.geometries.get(key);
                if (geometry) {
                    geometry.dispose();
                }
                this.geometries.delete(key);
                this.refCounts.delete(key);
            }
        }
    }

    dispose() {
        for (const geometry of this.geometries.values()) {
            geometry.dispose();
        }
        this.geometries.clear();
        this.refCounts.clear();
    }
}

// Global geometry pool instance
export const geometryPool = new GeometryPool();

// Optimized geometry creation functions
export function createOptimizedGeometry(type, ...args) {
    return geometryPool.getGeometry(type, ...args);
}

// Common geometries that are frequently used
export const CommonGeometries = {
    wheel: () => createOptimizedGeometry('CylinderGeometry', 1, 1, 0.5, 16),
    engineWheel: (size) => createOptimizedGeometry('CylinderGeometry', size, size, 0.6, 16),
    box: (w, h, d) => createOptimizedGeometry('BoxGeometry', w, h, d),
    cylinder: (rt, rb, h, rs) => createOptimizedGeometry('CylinderGeometry', rt, rb, h, rs),
    sphere: (r, ws, hs) => createOptimizedGeometry('SphereGeometry', r, ws, hs),
    plane: (w, h) => createOptimizedGeometry('PlaneGeometry', w, h),
    cone: (r, h, rs) => createOptimizedGeometry('ConeGeometry', r, h, rs)
};