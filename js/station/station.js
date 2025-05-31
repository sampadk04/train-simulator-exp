// filepath: /Users/sampadk04/Desktop/Coding/Non_GitHub/Train_Simulator/js/station/station.js
// Core station functionality
// Assumes createTerminalBuilding, createPlatformCanopy, createEntranceArea, createWalkwayBridge,
// addStationAmenities, addStationLighting, addStationSignage are available

function createStation() {
    const stationT = 0.25; // Position at 1/4 around the track (90 degrees)
    const stationPosition = curve.getPoint(stationT);
    const stationGroup = new THREE.Group();
    
    const tangent = curve.getTangent(stationT);
    const normal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    
    // Main Platform (closest to track)
    const mainPlatformWidth = 8;
    const mainPlatformLength = 80;
    const platformHeight = 1.2;
    
    const mainPlatform = createPlatform(mainPlatformWidth, mainPlatformLength, platformHeight);
    mainPlatform.position.copy(stationPosition).add(
        normal.clone().multiplyScalar(gauge/2 + mainPlatformWidth/2 + 1)
    );
    mainPlatform.position.y = platformHeight/2;
    mainPlatform.lookAt(mainPlatform.position.clone().add(tangent));
    stationGroup.add(mainPlatform);
    
    // Secondary Platform (parallel to main platform)
    const secondaryPlatform = createPlatform(6, 60, platformHeight);
    secondaryPlatform.position.copy(mainPlatform.position).add(
        normal.clone().multiplyScalar(mainPlatformWidth/2 + 6/2 + 3)
    );
    secondaryPlatform.lookAt(secondaryPlatform.position.clone().add(tangent));
    stationGroup.add(secondaryPlatform);
    
    // Main Terminal Building
    const terminalBuilding = createTerminalBuilding(tangent, normal);
    terminalBuilding.position.copy(mainPlatform.position).add(
        normal.clone().multiplyScalar(mainPlatformWidth/2 + 25)
    );
    terminalBuilding.lookAt(terminalBuilding.position.clone().add(tangent));
    stationGroup.add(terminalBuilding);
    
    // Platform Canopy/Roof Structure
    const canopy = createPlatformCanopy(mainPlatformLength - 10);
    canopy.position.copy(mainPlatform.position);
    canopy.position.y = platformHeight + 6;
    canopy.lookAt(canopy.position.clone().add(tangent));
    stationGroup.add(canopy);
    
    // Entry/Exit Areas
    const entranceArea = createEntranceArea(tangent, normal, "ENTRANCE");
    entranceArea.position.copy(terminalBuilding.position).add(
        tangent.clone().multiplyScalar(-30)
    ).add(normal.clone().multiplyScalar(15));
    entranceArea.lookAt(entranceArea.position.clone().add(tangent));
    stationGroup.add(entranceArea);
    
    const exitArea = createEntranceArea(tangent, normal, "EXIT");
    exitArea.position.copy(terminalBuilding.position).add(
        tangent.clone().multiplyScalar(30)
    ).add(normal.clone().multiplyScalar(15));
    exitArea.lookAt(exitArea.position.clone().add(tangent));
    stationGroup.add(exitArea);
    
    // Connecting Bridges/Walkways
    const bridge1 = createWalkwayBridge();
    bridge1.position.copy(mainPlatform.position).add(
        tangent.clone().multiplyScalar(-20)
    ).add(normal.clone().multiplyScalar(mainPlatformWidth/2 + 1.5));
    bridge1.lookAt(bridge1.position.clone().add(normal));
    stationGroup.add(bridge1);
    
    const bridge2 = createWalkwayBridge();
    bridge2.position.copy(mainPlatform.position).add(
        tangent.clone().multiplyScalar(20)
    ).add(normal.clone().multiplyScalar(mainPlatformWidth/2 + 1.5));
    bridge2.lookAt(bridge2.position.clone().add(normal));
    stationGroup.add(bridge2);
    
    // Station Amenities
    addStationAmenities(stationGroup, mainPlatform, secondaryPlatform, tangent, normal, platformHeight);
    
    // Lighting and Details
    addStationLighting(stationGroup, mainPlatform, secondaryPlatform, tangent, normal, platformHeight);
    
    // Information Boards and Signage
    addStationSignage(stationGroup, mainPlatform, tangent, normal, platformHeight);
    
    scene.add(stationGroup);
    
    return {
        position: stationPosition,
        tangent: tangent,
        normal: normal,
        width: 80, // Much larger footprint
        length: 120, // Extended length
        t: stationT
    };
}

function createPlatform(width, length, height) {
    const platform = new THREE.Group();
    
    // Main platform surface
    const platformGeometry = new THREE.BoxGeometry(width, height, length);
    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 });
    const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.add(platformMesh);
    
    // Platform edge (yellow safety line)
    const edgeGeometry = new THREE.BoxGeometry(0.3, 0.05, length);
    const edgeMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edge.position.set(-width/2 + 0.15, height/2 + 0.025, 0);
    platform.add(edge);
    
    // Platform texture lines
    for (let i = -length/2; i < length/2; i += 4) {
        const lineGeometry = new THREE.BoxGeometry(width, 0.02, 0.1);
        const lineMaterial = new THREE.MeshLambertMaterial({ color: 0x999999 });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(0, height/2 + 0.01, i);
        platform.add(line);
    }
    
    return platform;
}

function isInStationArea(x, z, station) {
    if (!station) return false;
    
    const toPoint = new THREE.Vector3(x - station.position.x, 0, z - station.position.z);
    const alongTrack = toPoint.dot(station.tangent);
    const fromTrack = toPoint.dot(station.normal);
    
    return Math.abs(alongTrack) < station.length/2 &&
           fromTrack > -station.width/4 &&
           fromTrack < station.width;
}