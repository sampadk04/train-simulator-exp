// Assuming THREE is globally available
// Assuming materials is globally available (or passed in if necessary)

/**
 * Creates a tunnel mesh.
 * @param {object} tunnelProperties - Properties for the tunnel.
 * @param {number} tunnelProperties.length - The length of the tunnel.
 * @param {THREE.Vector2[]} tunnelProperties.crossSectionShape - An array of THREE.Vector2 points defining the tunnel's cross-section.
 * @param {THREE.Material} tunnelProperties.material - The material for the tunnel.
 */
function createTunnel(tunnelProperties) {
    const { length, crossSectionShape, material } = tunnelProperties;

    const shape = new THREE.Shape(crossSectionShape);

    // The extrude path is a simple straight line along the Z-axis (before rotation by caller)
    const extrudeLine = new THREE.LineCurve3(
        new THREE.Vector3(0, 0, -length / 2),
        new THREE.Vector3(0, 0, length / 2)
    );

    const extrudeSettings = {
        steps: 2, // Minimal steps for a straight tunnel
        bevelEnabled: false,
        extrudePath: extrudeLine
    };

    const tunnelGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const tunnelMaterial = material || materials.rock; // Default to materials.rock or a generic one

    const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);

    // The caller will be responsible for positioning and orienting this tunnel.
    // tunnel.position.set(x, y, z);
    // tunnel.lookAt(targetPosition);

    return tunnel;
}

/**
 * Calculates a world-axis-aligned bounding box for the tunnel.
 * This is a simplified bounding box for tree avoidance.
 * For more accuracy with rotated tunnels, OBB (Oriented Bounding Box) would be better.
 * @param {THREE.Mesh} tunnelMesh - The tunnel mesh.
 * @param {number} padding - Optional padding around the tunnel.
 */
function getTunnelBoundingBox(tunnelMesh, padding = 5) {
    if (!tunnelMesh) return null;

    const box = new THREE.Box3().setFromObject(tunnelMesh);

    // Add padding if needed
    box.min.x -= padding;
    box.min.z -= padding;
    box.max.x += padding;
    box.max.z += padding;
    // Y padding might also be relevant depending on how trees are placed.
    // For ground trees, primarily X and Z are important.
    // box.min.y -= padding;
    // box.max.y += padding;


    return {
        min: { x: box.min.x, z: box.min.z },
        max: { x: box.max.x, z: box.max.z },
        // Storing the full box3 might be useful for more complex checks
        // box3: box
    };
}
