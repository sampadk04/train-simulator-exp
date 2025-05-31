// Assuming THREE is globally available
// Assuming materials is globally available (or passed in if necessary)

function createHill(hillRadius = 60, hillHeight = 30, segments = 32) {
    // Using a wide, short cylinder for a basic hill shape.
    // A sphere geometry or more complex Perlin noise based terrain could also be used.
    const hillGeometry = new THREE.CylinderGeometry(
        hillRadius, // radiusTop
        hillRadius, // radiusBottom
        hillHeight, // height
        segments,   // radialSegments
        1,          // heightSegments
        false,      // openEnded
        0,          // thetaStart
        Math.PI * 2 // thetaLength
    );

    // To make it look more like a hill, we can try to make the top part shorter,
    // or use a SphereGeometry and flatten its bottom.
    // For simplicity, a basic cylinder is used first.
    // We can also adjust material. For now, let's assume a grass or rock material exists.

    const hillMaterial = materials.grass; // Or materials.rock if defined and preferred

    const hill = new THREE.Mesh(hillGeometry, hillMaterial);

    // The caller will be responsible for positioning this hill.
    // hill.position.set(x, y, z);
    // The y position should typically be hillHeight / 2 if the base is at y=0.

    return hill;
}
