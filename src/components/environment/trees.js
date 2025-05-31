import { SIMULATION_CONFIG } from '../../core/constants.js';
import { scene } from '../../core/scene.js';
import { materials } from '../../core/materials.js';

function createTree(height = 10, x = 0, z = 0) {
    const tree = new THREE.Group();

    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, height * 0.4, 8);
    const trunk = new THREE.Mesh(trunkGeometry, materials.treeTrunk);
    trunk.position.y = height * 0.2;
    tree.add(trunk);

    const foliageLayers = 3;
    for (let i = 0; i < foliageLayers; i++) {
        const size = height * 0.6 * (1 - i * 0.2);
        const foliageGeometry = new THREE.ConeGeometry(size * 0.5, size, 8);
        const foliage = new THREE.Mesh(foliageGeometry, materials.treeLeaves);
        foliage.position.y = height * 0.4 + i * size * 0.5;
        tree.add(foliage);
    }

    tree.position.set(x, 0, z);
    scene.add(tree);
    return tree;
}

export function populateTrees(station, tunnelData, isInStationArea, isInTunnelArea) {
    const { RADIUS, GAUGE } = SIMULATION_CONFIG.TRACK;
    const { GROUND_SIZE_MULTIPLIER, TREE_COUNT, TREE_HEIGHT_MIN, TREE_HEIGHT_VARIATION, SAFE_RADIUS_OFFSET } = SIMULATION_CONFIG.ENVIRONMENT;
    
    const groundSize = RADIUS * GROUND_SIZE_MULTIPLIER * 0.7; // Slightly smaller for better distribution
    const safeRadius = RADIUS + GAUGE + SAFE_RADIUS_OFFSET;

    for (let i = 0; i < TREE_COUNT; i++) {
        let x, z;
        const isInsideCircle = () => Math.sqrt(x*x + z*z) < safeRadius;
        const isInStation = () => isInStationArea(x, z, station);
        const isInTunnel = () => isInTunnelArea(x, z, tunnelData);

        do {
            x = (Math.random() - 0.5) * groundSize;
            z = (Math.random() - 0.5) * groundSize;
        } while (isInsideCircle() || isInStation() || isInTunnel());

        const height = TREE_HEIGHT_MIN + Math.random() * TREE_HEIGHT_VARIATION;
        createTree(height, x, z);
    }
}

export { createTree };