function createGround() {
    // Assuming 'radius', 'materials', and 'scene' are globally accessible
    // or will be passed/imported later. For now, keep original references.
    const groundSize = radius * 3;
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    groundGeometry.rotateX(-Math.PI / 2);
    const ground = new THREE.Mesh(groundGeometry, materials.grass);
    ground.position.y = -0.1;
    scene.add(ground);

    const innerGroundGeometry = new THREE.RingGeometry(radius - gauge - 2, radius + gauge + 2, 64);
    innerGroundGeometry.rotateX(-Math.PI / 2);
    const trackBed = new THREE.Mesh(
        innerGroundGeometry,
        new THREE.MeshLambertMaterial({ color: 0x5a5e47 })
    );
    trackBed.position.y = 0;
    scene.add(trackBed);
}
