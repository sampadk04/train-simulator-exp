// Assuming 'curve', 'gauge', 'materials', 'scene', and 'THREE'
// (for Vector3, BoxGeometry, MeshLambertMaterial, ConeGeometry, MeshBasicMaterial, PlaneGeometry etc.)
// are globally accessible or will be passed/imported later.

function createStation() {
    // Assuming 'curve', 'gauge', 'materials', 'scene', 'THREE' are accessible
    const stationT = 0.25; // Position at 1/4 around the track (90 degrees)
    const stationPosition = curve.getPoint(stationT);
    const stationGroup = new THREE.Group();

    // Platform - made larger to better connect with tunnel
    const platformWidth = 12; // Increased from 8
    const platformLength = 60; // Increased from 40 to better span tunnel area
    const platformHeight = 1;
    const platformGeometry = new THREE.BoxGeometry(platformWidth, platformHeight, platformLength);
    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0xB5B5B5 });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);

    const tangent = curve.getTangent(stationT);
    const normal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();

    platform.position.copy(stationPosition).add(
        normal.clone().multiplyScalar(gauge/2 + platformWidth/2 + 0.5)
    );
    platform.position.y = platformHeight/2;
    platform.lookAt(platform.position.clone().add(tangent));
    stationGroup.add(platform);

    // Station building - made larger
    const buildingWidth = 16; // Increased from 12
    const buildingDepth = 10; // Increased from 8
    const buildingHeight = 8; // Increased from 6
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
    const roofHeight = 4; // Increased from 3
    const roofGeometry = new THREE.ConeGeometry(buildingWidth/1.5, roofHeight, 4);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);

    roof.position.copy(building.position);
    roof.position.y = buildingHeight + roofHeight/2;
    roof.rotation.y = building.rotation.y + Math.PI/4;
    stationGroup.add(roof);

    // Windows and door - adjusted for larger building
    const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB });
    const frontNormal = normal.clone().negate();
    const windowSize = { width: 1.5, height: 2.5 }; // Made windows taller
    const doorSize = { width: 2.5, height: 4 }; // Made door larger

    for (let i = -2; i <= 2; i++) { // More windows for larger building
        if (i === 0) continue;
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

    const doorGeometry = new THREE.PlaneGeometry(doorSize.width, doorSize.height);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);

    door.position.copy(building.position)
        .add(frontNormal.clone().multiplyScalar(buildingDepth/2 + 0.05));
    door.position.y = doorSize.height/2 - 0.25;
    door.lookAt(door.position.clone().add(frontNormal));
    stationGroup.add(door);

    // Benches - more benches for longer platform
    const benchMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    for (let i = -2; i <= 2; i++) { // More benches spread across longer platform
        const benchSeatGeometry = new THREE.BoxGeometry(1, 0.5, 2.5);
        const benchSeat = new THREE.Mesh(benchSeatGeometry, benchMaterial);
        benchSeat.position.copy(platform.position)
            .add(frontNormal.clone().multiplyScalar(platformWidth/4))
            .add(tangent.clone().multiplyScalar(i * 12)); // Adjusted spacing
        benchSeat.position.y = platformHeight + benchSeatGeometry.parameters.height/2;
        benchSeat.lookAt(benchSeat.position.clone().add(tangent));
        stationGroup.add(benchSeat);

        const benchBackGeometry = new THREE.BoxGeometry(1, 1, 2.5);
        const benchBack = new THREE.Mesh(benchBackGeometry, benchMaterial);
        benchBack.position.copy(benchSeat.position)
            .add(tangent.clone().multiplyScalar(benchSeatGeometry.parameters.width/2));
        benchBack.position.y = platformHeight + benchSeatGeometry.parameters.height + benchBackGeometry.parameters.height/2;
        benchBack.lookAt(benchBack.position.clone().add(tangent));
        stationGroup.add(benchBack);
    }

    // Station sign - made larger
    const signGeometry = new THREE.BoxGeometry(14, 2.5, 0.5); // Increased size
    const signMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const sign = new THREE.Mesh(signGeometry, signMaterial);

    sign.position.copy(platform.position)
        .add(tangent.clone().multiplyScalar(-platformLength/4))
        .add(frontNormal.clone().multiplyScalar(platformWidth/2 - 1));
    sign.position.y = platformHeight + 6; // Raised higher
    sign.lookAt(sign.position.clone().add(normal));
    stationGroup.add(sign);

    // Sign poles
    const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 7); // Taller poles
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    for (let i = -1; i <= 1; i += 2) {
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.copy(sign.position)
            .add(tangent.clone().multiplyScalar(i * signGeometry.parameters.width/2.2));
        pole.position.y = platformHeight + poleGeometry.parameters.height/2;
        stationGroup.add(pole);
    }

    scene.add(stationGroup);

    return {
        position: stationPosition,
        tangent: tangent,
        normal: normal,
        width: Math.max(platformWidth, buildingWidth) + 12, // Increased area
        length: Math.max(platformLength, buildingDepth) + 15, // Increased area
        t: stationT
    };
}

function isInStationArea(x, z, station) {
    // Assuming 'THREE' is accessible for Vector3
    if (!station) return false;

    const toPoint = new THREE.Vector3(x - station.position.x, 0, z - station.position.z);
    const alongTrack = toPoint.dot(station.tangent);
    const fromTrack = toPoint.dot(station.normal);

    return Math.abs(alongTrack) < station.length/2 &&
           fromTrack > -station.width/4 &&
           fromTrack < station.width;
}
