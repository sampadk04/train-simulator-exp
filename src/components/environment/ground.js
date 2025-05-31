import { SIMULATION_CONFIG } from '../../core/constants.js';
import { scene } from '../../core/scene.js';
import { materials } from '../../core/materials.js';

export function createGround() {
    const { RADIUS, GAUGE } = SIMULATION_CONFIG.TRACK;
    const groundSize = RADIUS * SIMULATION_CONFIG.ENVIRONMENT.GROUND_SIZE_MULTIPLIER;
    
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    groundGeometry.rotateX(-Math.PI / 2);
    const ground = new THREE.Mesh(groundGeometry, materials.grass);
    ground.position.y = -0.1;
    scene.add(ground);

    const innerGroundGeometry = new THREE.RingGeometry(RADIUS - GAUGE - 2, RADIUS + GAUGE + 2, 64);
    innerGroundGeometry.rotateX(-Math.PI / 2);
    const trackBed = new THREE.Mesh(
        innerGroundGeometry,
        new THREE.MeshLambertMaterial({ color: 0x5a5e47 })
    );
    trackBed.position.y = 0;
    scene.add(trackBed);
}