function createGround() {
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

function createTrack() {
    const railShape = new THREE.Shape();
    railShape.moveTo(-0.5, 0).lineTo(0.5, 0).lineTo(0.5, 0.5).lineTo(-0.5, 0.5).lineTo(-0.5, 0);
    
    const extrudeSettings = { steps: 100, bevelEnabled: false };
    
    const innerRail = createRail(radius - gauge/2);
    const outerRail = createRail(radius + gauge/2);
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

function createRail(r) {
    const railShape = new THREE.Shape();
    railShape.moveTo(-0.5, 0).lineTo(0.5, 0).lineTo(0.5, 0.5).lineTo(-0.5, 0.5).lineTo(-0.5, 0);
    
    const extrudeSettings = { steps: 100, bevelEnabled: false };
    
    return new THREE.Mesh(
        new THREE.ExtrudeGeometry(railShape, {...extrudeSettings, extrudePath: new CircleCurve(r)}), 
        materials.rail
    );
}

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

function createStation() {
    const stationT = 0.25; // Position at 1/4 around the track (90 degrees)
    const stationPosition = curve.getPoint(stationT);
    const stationGroup = new THREE.Group();
    
    // Platform
    const platformWidth = 8;
    const platformLength = 40;
    const platformHeight = 1;
    const platformGeometry = new THREE.BoxGeometry(platformWidth, platformHeight, platformLength);
    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0xB5B5B5 });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    
    // Get the orientation at this point on the curve
    const tangent = curve.getTangent(stationT);
    const normal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    
    // Position the platform directly next to the track
    platform.position.copy(stationPosition).add(
        normal.clone().multiplyScalar(gauge/2 + platformWidth/2 + 0.5)
    );
    platform.position.y = platformHeight/2;
    platform.lookAt(platform.position.clone().add(tangent));
    stationGroup.add(platform);
    
    // Station building
    const buildingWidth = 12;
    const buildingDepth = 8;
    const buildingHeight = 6;
    const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
    const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    
    building.position.copy(platform.position).add(
        normal.clone().multiplyScalar(platformWidth/2 + buildingDepth/2 + 1)
    );
    building.position.y = buildingHeight/2;
    building.lookAt(building.position.clone().add(tangent));
    stationGroup.add(building);
    
    // Roof
    const roofHeight = 3;
    const roofGeometry = new THREE.ConeGeometry(buildingWidth/1.5, roofHeight, 4);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    
    roof.position.copy(building.position);
    roof.position.y = buildingHeight + roofHeight/2;
    roof.rotation.y = building.rotation.y + Math.PI/4;
    stationGroup.add(roof);
    
    // Windows and door
    const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB });
    
    // Front windows facing the platform
    const frontNormal = normal.clone().negate();
    const windowSize = { width: 1.5, height: 2 };
    const doorSize = { width: 2, height: 3.5 };
    
    // Add three windows on the platform side
    for (let i = -1; i <= 1; i++) {
        if (i === 0) continue; // Skip middle position for door
        
        const windowGeometry = new THREE.PlaneGeometry(windowSize.width, windowSize.height);
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        
        const windowOffset = tangent.clone().multiplyScalar(i * 3);
        window.position.copy(building.position)
            .add(frontNormal.clone().multiplyScalar(buildingDepth/2 + 0.05))
            .add(windowOffset);
        window.position.y = buildingHeight/2;
        
        window.lookAt(window.position.clone().add(frontNormal));
        stationGroup.add(window);
    }
    
    // Door in the middle
    const doorGeometry = new THREE.PlaneGeometry(doorSize.width, doorSize.height);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    
    door.position.copy(building.position)
        .add(frontNormal.clone().multiplyScalar(buildingDepth/2 + 0.05));
    door.position.y = doorSize.height/2 - 0.25;
    door.lookAt(door.position.clone().add(frontNormal));
    stationGroup.add(door);
    
    // Benches on the platform
    const benchMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    for (let i = -1; i <= 1; i++) {
        const benchSeatGeometry = new THREE.BoxGeometry(1, 0.5, 2.5);
        const benchSeat = new THREE.Mesh(benchSeatGeometry, benchMaterial);
        
        benchSeat.position.copy(platform.position)
            .add(frontNormal.clone().multiplyScalar(platformWidth/4))
            .add(tangent.clone().multiplyScalar(i * 10));
        benchSeat.position.y = platformHeight + benchSeatGeometry.parameters.height/2;
        benchSeat.lookAt(benchSeat.position.clone().add(tangent));
        stationGroup.add(benchSeat);
        
        // Bench back
        const benchBackGeometry = new THREE.BoxGeometry(1, 1, 2.5);
        const benchBack = new THREE.Mesh(benchBackGeometry, benchMaterial);
        
        benchBack.position.copy(benchSeat.position)
            .add(tangent.clone().multiplyScalar(benchSeatGeometry.parameters.width/2));
        benchBack.position.y = platformHeight + benchSeatGeometry.parameters.height + benchBackGeometry.parameters.height/2;
        benchBack.lookAt(benchBack.position.clone().add(tangent));
        stationGroup.add(benchBack);
    }
    
    // Station sign
    const signGeometry = new THREE.BoxGeometry(10, 2, 0.5);
    const signMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    
    sign.position.copy(platform.position)
        .add(tangent.clone().multiplyScalar(-platformLength/4))
        .add(frontNormal.clone().multiplyScalar(platformWidth/2 - 1));
    sign.position.y = platformHeight + 5;
    sign.lookAt(sign.position.clone().add(normal));
    stationGroup.add(sign);
    
    // Add sign poles
    const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 6);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    for (let i = -1; i <= 1; i += 2) {
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.copy(sign.position)
            .add(tangent.clone().multiplyScalar(i * signGeometry.parameters.width/2.2));
        pole.position.y = platformHeight + poleGeometry.parameters.height/2;
        stationGroup.add(pole);
    }
    
    scene.add(stationGroup);
    
    // Return station data for tree avoidance
    return {
        position: stationPosition,
        tangent: tangent,
        normal: normal,
        width: Math.max(platformWidth, buildingWidth) + 10,
        length: Math.max(platformLength, buildingDepth) + 10,
        t: stationT
    };
}

function isInStationArea(x, z, station) {
    if (!station) return false;
    
    // Vector from station center to test point
    const toPoint = new THREE.Vector3(x - station.position.x, 0, z - station.position.z);
    
    // Project onto tangent and normal axes
    const alongTrack = toPoint.dot(station.tangent);
    const fromTrack = toPoint.dot(station.normal);
    
    // Check if point is within station bounds
    return Math.abs(alongTrack) < station.length/2 && 
           fromTrack > -station.width/4 && 
           fromTrack < station.width;
}

function populateTrees(station) {
    const groundSize = radius * 2.8;
    const safeRadius = radius + gauge + 15;
    const treeCount = 40;
    
    for (let i = 0; i < treeCount; i++) {
        let x, z;
        const isInsideCircle = () => Math.sqrt(x*x + z*z) < safeRadius;
        const isInStation = () => isInStationArea(x, z, station);
        
        do {
            x = (Math.random() - 0.5) * groundSize;
            z = (Math.random() - 0.5) * groundSize;
        } while (isInsideCircle() || isInStation());
        
        const height = 8 + Math.random() * 7;
        createTree(height, x, z);
    }
}

function setupEnvironment() {
    createGround();
    createTrack();
    const station = createStation();
    populateTrees(station);
}
