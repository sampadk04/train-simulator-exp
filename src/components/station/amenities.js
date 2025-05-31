// filepath: /Users/sampadk04/Desktop/Coding/Non_GitHub/Train_Simulator/js/station/amenities.js
// Station amenities like benches, kiosks, vending machines, lighting, and signage

export function addStationAmenities(stationGroup, mainPlatform, secondaryPlatform, tangent, normal, platformHeight) {
    // Benches on main platform
    for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const bench = createBench();
        bench.position.copy(mainPlatform.position).add(
            tangent.clone().multiplyScalar(i * 12)
        ).add(normal.clone().multiplyScalar(2));
        bench.position.y = platformHeight;
        // Rotate bench by -90 degrees to face the track properly
        bench.rotation.y = -Math.PI / 2;
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
    
    // Seat - made even bigger
    const seatGeometry = new THREE.BoxGeometry(1.0, 0.2, 3.5);
    const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = 0.6;
    bench.add(seat);
    
    // Backrest - positioned at the back (positive x direction)
    const backGeometry = new THREE.BoxGeometry(0.2, 1.4, 3.5);
    const back = new THREE.Mesh(backGeometry, seatMaterial);
    back.position.set(0.5, 1.0, 0);
    bench.add(back);
    
    // Legs - adjusted for larger bench
    for (let i of [-1.4, 1.4]) {
        for (let j of [-0.3, 0.3]) {
            const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
            const legMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(j, 0.3, i);
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

export function addStationLighting(stationGroup, mainPlatform, secondaryPlatform, tangent, normal, platformHeight) {
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

export function addStationSignage(stationGroup, mainPlatform, tangent, normal, platformHeight) {
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