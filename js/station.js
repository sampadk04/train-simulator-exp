// Assuming 'curve', 'gauge', 'materials', 'scene', and 'THREE'
// (for Vector3, BoxGeometry, MeshLambertMaterial, ConeGeometry, MeshBasicMaterial, PlaneGeometry etc.)
// are globally accessible or will be passed/imported later.

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

function createTerminalBuilding(tangent, normal) {
    const building = new THREE.Group();
    
    // Main building structure
    const buildingWidth = 40;
    const buildingDepth = 20;
    const buildingHeight = 12;
    
    const mainStructure = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
    const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0xE6E6FA });
    const mainBuilding = new THREE.Mesh(mainStructure, buildingMaterial);
    mainBuilding.position.y = buildingHeight/2;
    building.add(mainBuilding);
    
    // Clock tower
    const towerGeometry = new THREE.BoxGeometry(6, 8, 6);
    const towerMaterial = new THREE.MeshLambertMaterial({ color: 0xD3D3D3 });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.set(0, buildingHeight + 4, 0);
    building.add(tower);
    
    // Clock face
    const clockGeometry = new THREE.CircleGeometry(2, 32);
    const clockMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const clock = new THREE.Mesh(clockGeometry, clockMaterial);
    clock.position.set(0, buildingHeight + 4, -3.1);
    building.add(clock);
    
    // Clock hands
    const hourHandGeometry = new THREE.BoxGeometry(0.1, 1.2, 0.05);
    const minuteHandGeometry = new THREE.BoxGeometry(0.05, 1.8, 0.05);
    const handMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const hourHand = new THREE.Mesh(hourHandGeometry, handMaterial);
    const minuteHand = new THREE.Mesh(minuteHandGeometry, handMaterial);
    hourHand.position.set(0, buildingHeight + 4, -3.05);
    minuteHand.position.set(0, buildingHeight + 4, -3.05);
    hourHand.rotation.z = Math.PI/6; // 2 o'clock position
    minuteHand.rotation.z = Math.PI/2; // 12 o'clock position
    building.add(hourHand);
    building.add(minuteHand);
    
    // Main entrance doors
    for (let i = -1; i <= 1; i++) {
        const doorGeometry = new THREE.PlaneGeometry(3, 8);
        const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(i * 4, 4, -buildingDepth/2 - 0.01);
        building.add(door);
    }
    
    // Windows
    const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB });
    for (let i = -3; i <= 3; i++) {
        if (Math.abs(i) === 1) continue; // Skip door areas
        const windowGeometry = new THREE.PlaneGeometry(2.5, 4);
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(i * 5, 6, -buildingDepth/2 - 0.01);
        building.add(window);
    }
    
    // Side windows
    for (let side of [-1, 1]) {
        for (let i = -1; i <= 1; i++) {
            const windowGeometry = new THREE.PlaneGeometry(2.5, 4);
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(side * buildingWidth/2 + side * 0.01, 6, i * 6);
            window.rotation.y = side * Math.PI/2;
            building.add(window);
        }
    }
    
    // Roof
    const roofGeometry = new THREE.BoxGeometry(buildingWidth + 2, 1, buildingDepth + 2);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = buildingHeight + 0.5;
    building.add(roof);
    
    return building;
}

function createPlatformCanopy(length) {
    const canopy = new THREE.Group();
    
    // Support pillars
    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 8, 8);
    const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
    
    for (let i = -length/2; i <= length/2; i += 15) {
        for (let side of [-3, 3]) {
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(side, 4, i);
            canopy.add(pillar);
        }
    }
    
    // Roof structure
    const roofGeometry = new THREE.BoxGeometry(8, 0.5, length);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 8.25;
    canopy.add(roof);
    
    // Glass panels
    const glassGeometry = new THREE.PlaneGeometry(8, 0.3);
    const glassMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x87CEEB, 
        transparent: true, 
        opacity: 0.3 
    });
    
    for (let i = -length/2; i <= length/2; i += 10) {
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        glass.position.set(0, 8.5, i);
        glass.rotation.x = -Math.PI/2;
        canopy.add(glass);
    }
    
    return canopy;
}

function createEntranceArea(tangent, normal, label) {
    const entrance = new THREE.Group();
    
    // Entrance plaza
    const plazaGeometry = new THREE.BoxGeometry(20, 0.2, 15);
    const plazaMaterial = new THREE.MeshLambertMaterial({ color: 0xD3D3D3 });
    const plaza = new THREE.Mesh(plazaGeometry, plazaMaterial);
    plaza.position.y = 0.1;
    entrance.add(plaza);
    
    // Entrance archway
    const archGeometry = new THREE.BoxGeometry(12, 8, 2);
    const archMaterial = new THREE.MeshLambertMaterial({ color: 0xE6E6FA });
    const arch = new THREE.Mesh(archGeometry, archMaterial);
    arch.position.y = 4;
    entrance.add(arch);
    
    // Arch opening
    const openingGeometry = new THREE.BoxGeometry(8, 6, 2.1);
    const openingMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const opening = new THREE.Mesh(openingGeometry, openingMaterial);
    opening.position.y = 3;
    entrance.add(opening);
    
    // Sign above arch
    const signGeometry = new THREE.BoxGeometry(10, 2, 0.5);
    const signMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.y = 8.5;
    entrance.add(sign);
    
    // Turnstiles
    for (let i = -1; i <= 1; i++) {
        const turnstileGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 8);
        const turnstileMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const turnstile = new THREE.Mesh(turnstileGeometry, turnstileMaterial);
        turnstile.position.set(i * 2.5, 1.5, -1);
        entrance.add(turnstile);
    }
    
    return entrance;
}

function createWalkwayBridge() {
    const bridge = new THREE.Group();
    
    // Bridge deck
    const deckGeometry = new THREE.BoxGeometry(3, 0.3, 20);
    const deckMaterial = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 });
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    deck.position.y = 4;
    bridge.add(deck);
    
    // Railings
    const railingGeometry = new THREE.BoxGeometry(0.1, 1.2, 20);
    const railingMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
    
    for (let side of [-1.5, 1.5]) {
        const railing = new THREE.Mesh(railingGeometry, railingMaterial);
        railing.position.set(side, 4.6, 0);
        bridge.add(railing);
    }
    
    // Support beams
    for (let i = -8; i <= 8; i += 4) {
        const beamGeometry = new THREE.BoxGeometry(0.2, 4, 0.2);
        const beamMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(0, 2, i);
        bridge.add(beam);
    }
    
    return bridge;
}

function addStationAmenities(stationGroup, mainPlatform, secondaryPlatform, tangent, normal, platformHeight) {
    // Benches on main platform
    for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const bench = createBench();
        bench.position.copy(mainPlatform.position).add(
            tangent.clone().multiplyScalar(i * 12)
        ).add(normal.clone().multiplyScalar(2));
        bench.position.y = platformHeight;
        bench.lookAt(bench.position.clone().add(tangent));
        stationGroup.add(bench);
    }
    
    // Kiosks
    const kiosk = createKiosk();
    kiosk.position.copy(mainPlatform.position).add(
        normal.clone().multiplyScalar(3)
    );
    kiosk.position.y = platformHeight;
    kiosk.lookAt(kiosk.position.clone().add(tangent));
    stationGroup.add(kiosk);
    
    // Vending machines
    for (let i = 0; i < 2; i++) {
        const vendingMachine = createVendingMachine();
        vendingMachine.position.copy(secondaryPlatform.position).add(
            tangent.clone().multiplyScalar((i - 0.5) * 8)
        ).add(normal.clone().multiplyScalar(2));
        vendingMachine.position.y = platformHeight;
        vendingMachine.lookAt(vendingMachine.position.clone().add(normal));
        stationGroup.add(vendingMachine);
    }
}

function createBench() {
    const bench = new THREE.Group();
    
    // Seat
    const seatGeometry = new THREE.BoxGeometry(0.5, 0.1, 2);
    const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = 0.4;
    bench.add(seat);
    
    // Backrest
    const backGeometry = new THREE.BoxGeometry(0.1, 0.8, 2);
    const back = new THREE.Mesh(backGeometry, seatMaterial);
    back.position.set(-0.25, 0.7, 0);
    bench.add(back);
    
    // Legs
    for (let i of [-0.8, 0.8]) {
        for (let j of [-0.15, 0.15]) {
            const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
            const legMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(j, 0.2, i);
            bench.add(leg);
        }
    }
    
    return bench;
}

function createKiosk() {
    const kiosk = new THREE.Group();
    
    // Main structure
    const mainGeometry = new THREE.BoxGeometry(3, 2.5, 2);
    const mainMaterial = new THREE.MeshLambertMaterial({ color: 0xDC143C });
    const main = new THREE.Mesh(mainGeometry, mainMaterial);
    main.position.y = 1.25;
    kiosk.add(main);
    
    // Window
    const windowGeometry = new THREE.PlaneGeometry(2, 1.5);
    const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x000080 });
    const window = new THREE.Mesh(windowGeometry, windowMaterial);
    window.position.set(0, 1.5, 1.01);
    kiosk.add(window);
    
    // Roof
    const roofGeometry = new THREE.BoxGeometry(3.5, 0.3, 2.5);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 2.65;
    kiosk.add(roof);
    
    return kiosk;
}

function createVendingMachine() {
    const machine = new THREE.Group();
    
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(1.2, 2, 0.8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    machine.add(body);
    
    // Display window
    const windowGeometry = new THREE.PlaneGeometry(0.8, 1.2);
    const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const window = new THREE.Mesh(windowGeometry, windowMaterial);
    window.position.set(0, 1.2, 0.41);
    machine.add(window);
    
    // Coin slot
    const slotGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.1);
    const slotMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const slot = new THREE.Mesh(slotGeometry, slotMaterial);
    slot.position.set(0.3, 0.8, 0.41);
    machine.add(slot);
    
    return machine;
}

function addStationLighting(stationGroup, mainPlatform, secondaryPlatform, tangent, normal, platformHeight) {
    // Platform lights
    for (let i = -3; i <= 3; i++) {
        const lightPole = createLightPole();
        lightPole.position.copy(mainPlatform.position).add(
            tangent.clone().multiplyScalar(i * 15)
        ).add(normal.clone().multiplyScalar(3.5));
        lightPole.position.y = platformHeight;
        stationGroup.add(lightPole);
    }
}

function createLightPole() {
    const pole = new THREE.Group();
    
    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 6, 8);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const polePost = new THREE.Mesh(poleGeometry, poleMaterial);
    polePost.position.y = 3;
    pole.add(polePost);
    
    // Light fixture
    const fixtureGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const fixtureMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFF0 });
    const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
    fixture.position.y = 6.5;
    pole.add(fixture);
    
    return pole;
}

function addStationSignage(stationGroup, mainPlatform, tangent, normal, platformHeight) {
    // Platform number signs
    for (let i = 0; i < 2; i++) {
        const sign = createPlatformSign(i + 1);
        sign.position.copy(mainPlatform.position).add(
            tangent.clone().multiplyScalar((i - 0.5) * 30)
        ).add(normal.clone().multiplyScalar(3));
        sign.position.y = platformHeight + 3;
        sign.lookAt(sign.position.clone().add(normal.clone().negate()));
        stationGroup.add(sign);
    }
    
    // Direction signs
    const departureSign = createDirectionSign("DEPARTURES");
    departureSign.position.copy(mainPlatform.position).add(
        tangent.clone().multiplyScalar(-25)
    ).add(normal.clone().multiplyScalar(2));
    departureSign.position.y = platformHeight + 4;
    departureSign.lookAt(departureSign.position.clone().add(tangent));
    stationGroup.add(departureSign);
    
    const arrivalSign = createDirectionSign("ARRIVALS");
    arrivalSign.position.copy(mainPlatform.position).add(
        tangent.clone().multiplyScalar(25)
    ).add(normal.clone().multiplyScalar(2));
    arrivalSign.position.y = platformHeight + 4;
    arrivalSign.lookAt(arrivalSign.position.clone().add(tangent.clone().negate()));
    stationGroup.add(arrivalSign);
}

function createPlatformSign(number) {
    const sign = new THREE.Group();
    
    // Sign board
    const boardGeometry = new THREE.BoxGeometry(3, 2, 0.2);
    const boardMaterial = new THREE.MeshLambertMaterial({ color: 0x000080 });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    sign.add(board);
    
    // Number display
    const numberGeometry = new THREE.PlaneGeometry(1, 1);
    const numberMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const numberDisplay = new THREE.Mesh(numberGeometry, numberMaterial);
    numberDisplay.position.z = 0.11;
    sign.add(numberDisplay);
    
    // Support post
    const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const postMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.y = -2.5;
    sign.add(post);
    
    return sign;
}

function createDirectionSign(text) {
    const sign = new THREE.Group();
    
    // Arrow sign
    const signGeometry = new THREE.BoxGeometry(6, 1.5, 0.2);
    const signMaterial = new THREE.MeshLambertMaterial({ color: 0x008000 });
    const signBoard = new THREE.Mesh(signGeometry, signMaterial);
    sign.add(signBoard);
    
    // Text area
    const textGeometry = new THREE.PlaneGeometry(5, 1);
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const textDisplay = new THREE.Mesh(textGeometry, textMaterial);
    textDisplay.position.z = 0.11;
    sign.add(textDisplay);
    
    // Support arm
    const armGeometry = new THREE.BoxGeometry(0.2, 0.2, 2);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const arm = new THREE.Mesh(armGeometry, armMaterial);
    arm.position.set(-3, 0, -1);
    sign.add(arm);
    
    return sign;
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
