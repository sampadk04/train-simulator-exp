import { SIMULATION_CONFIG } from '../../core/constants.js';
import { scene, curve, CircleCurve } from '../../core/scene.js';
import { materials } from '../../core/materials.js';
import { createMesh, setObjectOnCurve } from '../../core/scene.js';

function createRail(r) {
    const railShape = new THREE.Shape();
    railShape.moveTo(-0.5, 0).lineTo(0.5, 0).lineTo(0.5, 0.5).lineTo(-0.5, 0.5).lineTo(-0.5, 0);

    const extrudeSettings = { steps: 100, bevelEnabled: false };

    return new THREE.Mesh(
        new THREE.ExtrudeGeometry(railShape, {...extrudeSettings, extrudePath: new CircleCurve(r)}),
        materials.rail
    );
}

export function createTrack() {
    const { RADIUS, GAUGE } = SIMULATION_CONFIG.TRACK;
    
    const innerRail = createRail(RADIUS - GAUGE/2);
    const outerRail = createRail(RADIUS + GAUGE/2);
    innerRail.position.y = outerRail.position.y = 1;
    scene.add(innerRail, outerRail);

    const sleeperGeometry = new THREE.BoxGeometry(10, 1, 2);
    sleeperGeometry.translate(0, 0.5, 0);
    for (let i = 0; i < 50; i++) {
        const sleeper = createMesh(sleeperGeometry, materials.sleeper);
        setObjectOnCurve(sleeper, curve, i/50, 0);
        scene.add(sleeper);
    }
}