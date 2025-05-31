import { SIMULATION_CONFIG } from './constants.js';

// Enhanced material management with shared instances and lazy loading
class MaterialManager {
    constructor() {
        this._materials = new Map();
        this._initialized = false;
    }

    get materials() {
        if (!this._initialized) {
            this._initializeMaterials();
            this._initialized = true;
        }
        return this._materialProxy;
    }

    _initializeMaterials() {
        const materialConfig = {
            rail: { type: 'MeshBasicMaterial', props: { color: 0x808080 } },
            sleeper: { type: 'MeshBasicMaterial', props: { color: 0x8B4513 } },
            engine: { type: 'MeshBasicMaterial', props: { color: 0x800000 } },
            cabin: { type: 'MeshBasicMaterial', props: { color: 0x556B2F } },
            wheel: { type: 'MeshBasicMaterial', props: { color: 0x000000 } },
            smokestack: { type: 'MeshBasicMaterial', props: { color: 0x333333 } },
            hitch: { type: 'MeshBasicMaterial', props: { color: 0x333333 } },
            compartment: { type: 'MeshBasicMaterial', props: { color: 0x8B4513 } },
            compartmentRoof: { type: 'MeshBasicMaterial', props: { color: 0x3b2e1e } },
            connector: { type: 'MeshBasicMaterial', props: { color: 0x222222 } },
            windows: { type: 'MeshBasicMaterial', props: { color: 0xADD8E6 } },
            chimneyCap: { type: 'MeshBasicMaterial', props: { color: 0x777777 } },
            cowcatcher: { type: 'MeshBasicMaterial', props: { color: 0x555555 } },
            boiler: { type: 'MeshBasicMaterial', props: { color: 0x990000 } },
            bell: { type: 'MeshBasicMaterial', props: { color: 0xFFD700 } },
            railings: { type: 'MeshBasicMaterial', props: { color: 0x444444 } },
            metalTrim: { type: 'MeshBasicMaterial', props: { color: 0xC0C0C0 } },
            grass: { type: 'MeshLambertMaterial', props: { color: 0x4CAF50 } },
            treeTrunk: { type: 'MeshLambertMaterial', props: { color: 0x8B4513 } },
            treeLeaves: { type: 'MeshLambertMaterial', props: { color: 0x228B22 } },
            tunnel: { type: 'MeshLambertMaterial', props: { color: 0x606060, side: THREE.DoubleSide } }
        };

        // Create proxy for lazy loading
        this._materialProxy = new Proxy({}, {
            get: (target, prop) => {
                if (!this._materials.has(prop)) {
                    const config = materialConfig[prop];
                    if (config) {
                        this._materials.set(prop, new THREE[config.type](config.props));
                    }
                }
                return this._materials.get(prop);
            }
        });
    }

    dispose() {
        for (const material of this._materials.values()) {
            material.dispose();
        }
        this._materials.clear();
    }
}

// Global material manager instance
const materialManager = new MaterialManager();
export const materials = materialManager.materials;

// Make materials globally accessible for backward compatibility
window.materials = materials;