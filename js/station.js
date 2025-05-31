// Assuming 'curve', 'gauge', 'materials', 'scene', and 'THREE'
// (for Vector3, BoxGeometry, MeshLambertMaterial, ConeGeometry, MeshBasicMaterial, PlaneGeometry etc.)
// are globally accessible or will be passed/imported later.

function createStation() {
    // Assuming 'curve', 'gauge', 'materials', 'scene', 'THREE' are accessible
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

    const tangent = curve.getTangent(stationT);
    const normal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();

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
    const frontNormal = normal.clone().negate();
    const windowSize = { width: 1.5, height: 2 };
    const doorSize = { width: 2, height: 3.5 };

    for (let i = -1; i <= 1; i++) {
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

    // Benches
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

        const benchBackGeometry = new THREE.BoxGeometry(1, 1, 2.5); // Corrected: benchBackGeometry was benchSeatGeometry
        const benchBack = new THREE.Mesh(benchBackGeometry, benchMaterial); // Corrected: benchBackGeometry
        benchBack.position.copy(benchSeat.position)
            .add(tangent.clone().multiplyScalar(benchSeatGeometry.parameters.width/2)); // This should be benchBackGeometry.parameters.depth / 2 or similar if rotating
        benchBack.position.y = platformHeight + benchSeatGeometry.parameters.height + benchBackGeometry.parameters.height/2; // Corrected: benchBackGeometry
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

    // Sign poles
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
    // Assuming 'THREE' is accessible for Vector3
    if (!station) return false;

    const toPoint = new THREE.Vector3(x - station.position.x, 0, z - station.position.z);
    const alongTrack = toPoint.dot(station.tangent);
    const fromTrack = toPoint.dot(station.normal);

    return Math.abs(alongTrack) < station.length/2 &&
           fromTrack > -station.width/4 &&
           fromTrack < station.width;
}
