// Assuming 'radius', 'gauge', 'materials', 'scene', 'curve',
// 'CircleCurve', 'setObjectOnCurve', and 'createMesh' are globally accessible
// or will be passed/imported later.

function createRail(r) {
    // Assuming 'THREE' and 'materials' are accessible
    const railShape = new THREE.Shape();
    railShape.moveTo(-0.5, 0).lineTo(0.5, 0).lineTo(0.5, 0.5).lineTo(-0.5, 0.5).lineTo(-0.5, 0);

    const extrudeSettings = { steps: 100, bevelEnabled: false };

    return new THREE.Mesh(
        new THREE.ExtrudeGeometry(railShape, {...extrudeSettings, extrudePath: new CircleCurve(r)}),
        materials.rail
    );
}

function createTrack() {
    // Assuming 'radius', 'gauge', 'scene', 'materials', 'curve',
    // 'setObjectOnCurve', 'createMesh' are accessible
    const innerRail = createRail(radius - gauge/2);
    const outerRail = createRail(radius + gauge/2);
    innerRail.position.y = outerRail.position.y = 1;
    scene.add(innerRail, outerRail);

    const sleeperGeometry = new THREE.BoxGeometry(10, 1, 2);
    sleeperGeometry.translate(0, 0.5, 0); // Adjusted to match original if y was 0.5
    for (let i = 0; i < 50; i++) {
        const sleeper = createMesh(sleeperGeometry, materials.sleeper);
        setObjectOnCurve(sleeper, curve, i/50, 0);
        scene.add(sleeper);
    }
}
