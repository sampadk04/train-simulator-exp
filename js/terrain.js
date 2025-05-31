// Assuming THREE is globally available
// Assuming materials is globally available (or passed in if necessary)

function createHill(hillRadiusBottom = 70, hillHeight = 40, segments = 32) { // Updated defaults
    const hillRadiusTop = 1; // Make it a cone
    const hillGeometry = new THREE.CylinderGeometry(
        hillRadiusTop,    // radiusTop
        hillRadiusBottom, // radiusBottom
        hillHeight,       // height
        segments,         // radialSegments
        1,                // heightSegments
        false,            // openEnded
        0,                // thetaStart
        Math.PI * 2       // thetaLength
    );

    const hillMaterial = materials.grass; // Or materials.rock

    const hill = new THREE.Mesh(hillGeometry, hillMaterial);

    // The caller will be responsible for positioning this hill.
    // hill.position.set(x, y, z);
    // The y position should typically be hillHeight / 2 if the base is at y=0.
    // This is handled in environment.js when placing the hill.

    return hill;
}
