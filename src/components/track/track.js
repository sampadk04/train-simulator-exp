import { SIMULATION_CONFIG } from '../../core/constants.js';
import { scene, curve, CircleCurve } from '../../core/scene.js';
import { materials } from '../../core/materials.js';
import { createMesh, setObjectOnCurve } from '../../core/scene.js';
import { geometryPool } from '../../core/geometry-pool.js';

// Cache for rail geometry to avoid recreation
let railGeometryCache = new Map();

function createRail(r) {
    const key = `rail_${r}`;
    
    if (railGeometryCache.has(key)) {
        return new THREE.Mesh(railGeometryCache.get(key), materials.rail);
    }

    const railShape = new THREE.Shape();
    railShape.moveTo(-0.5, 0).lineTo(0.5, 0).lineTo(0.5, 0.5).lineTo(-0.5, 0.5).lineTo(-0.5, 0);

    const extrudeSettings = { steps: 100, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(railShape, {...extrudeSettings, extrudePath: new CircleCurve(r)});
    
    railGeometryCache.set(key, geometry);
    return new THREE.Mesh(geometry, materials.rail);
}

export function createTrack() {
    const { RADIUS, GAUGE } = SIMULATION_CONFIG.TRACK;
    
    const innerRail = createRail(RADIUS - GAUGE/2);
    const outerRail = createRail(RADIUS + GAUGE/2);
    innerRail.position.y = outerRail.position.y = 1;
    scene.add(innerRail, outerRail);

    // Use geometry pool for sleepers
    const sleeperGeometry = geometryPool.getGeometry('BoxGeometry', 10, 1, 2);
    const sleeperCount = 50;
    
    // Batch create sleepers for better performance
    const sleepers = [];
    for (let i = 0; i < sleeperCount; i++) {
        const sleeper = createMesh(sleeperGeometry.clone(), materials.sleeper);
        sleeper.position.y = 0.5;
        setObjectOnCurve(sleeper, curve, i/sleeperCount, 0);
        sleepers.push(sleeper);
    }
    
    // Add all sleepers to scene at once
    sleepers.forEach(sleeper => scene.add(sleeper));
}