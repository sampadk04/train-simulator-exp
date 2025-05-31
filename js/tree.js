// Assuming 'materials', 'scene', 'radius', 'gauge',
// 'isInStationArea' (which will be moved to station.js later but for now might be global or passed)
// and 'THREE' are accessible.

function createTree(height = 10, x = 0, z = 0) {
    // Assuming 'THREE', 'materials', 'scene' are accessible
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

function populateTrees(station, tunnelData) { // Added tunnelData parameter
    // Assuming 'radius', 'gauge', 'scene', 'isInStationArea', 'createTree' are accessible
    // Assuming 'isInTunnelArea' is accessible (from tunnel.js)
    const groundSize = radius * 2.8; // Matched original environment.js
    const safeRadius = radius + gauge + 15; // Matched original environment.js
    const treeCount = 40; // Matched original environment.js

    for (let i = 0; i < treeCount; i++) {
        let x, z;
        // isInStationArea might need to be passed to populateTrees if it's in station.js
        // or accessed globally if station.js is loaded first.
        // For now, assuming it's available.
        const isInsideCircle = () => Math.sqrt(x*x + z*z) < safeRadius;
        const isInStation = () => isInStationArea(x, z, station); // Dependency on isInStationArea
        const isInTunnel = () => isInTunnelArea(x, z, tunnelData); // Dependency on isInTunnelArea

        do {
            x = (Math.random() - 0.5) * groundSize;
            z = (Math.random() - 0.5) * groundSize;
        } while (isInsideCircle() || isInStation() || isInTunnel()); // Added isInTunnel()

        const height = 8 + Math.random() * 7;
        createTree(height, x, z); // Calls local createTree
    }
}
