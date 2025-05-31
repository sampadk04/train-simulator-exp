// filepath: /Users/sampadk04/Desktop/Coding/Non_GitHub/Train_Simulator/js/station/amenities.js
// Station amenities like benches, kiosks, vending machines, lighting, and signage

import { geometryPool } from '../../core/geometry-pool.js';
import { materials } from '../../core/materials.js';
import { createMesh } from '../../core/scene.js';

// Cached geometries for station amenities
const amenityGeometries = {
    bench: {
        seat: () => geometryPool.getGeometry('BoxGeometry', 1.0, 0.2, 3.5),
        back: () => geometryPool.getGeometry('BoxGeometry', 0.2, 1.4, 3.5),
        leg: () => geometryPool.getGeometry('CylinderGeometry', 0.1, 0.1, 0.6, 8)
    },
    kiosk: {
        main: () => geometryPool.getGeometry('BoxGeometry', 3, 2.5, 2),
        window: () => geometryPool.getGeometry('PlaneGeometry', 2, 1.5),
        roof: () => geometryPool.getGeometry('BoxGeometry', 3.5, 0.3, 2.5)
    },
    vendingMachine: {
        body: () => geometryPool.getGeometry('BoxGeometry', 1.2, 2, 0.8),
        window: () => geometryPool.getGeometry('PlaneGeometry', 0.8, 1.2),
        slot: () => geometryPool.getGeometry('BoxGeometry', 0.2, 0.05, 0.1)
    },
    lightPole: {
        pole: () => geometryPool.getGeometry('CylinderGeometry', 0.15, 0.15, 6, 8),
        fixture: () => geometryPool.getGeometry('SphereGeometry', 0.5, 16, 16)
    },
    sign: {
        board: () => geometryPool.getGeometry('BoxGeometry', 3, 2, 0.2),
        number: () => geometryPool.getGeometry('PlaneGeometry', 1, 1),
        post: () => geometryPool.getGeometry('CylinderGeometry', 0.1, 0.1, 3, 8),
        direction: () => geometryPool.getGeometry('BoxGeometry', 6, 1.5, 0.2),
        text: () => geometryPool.getGeometry('PlaneGeometry', 5, 1),
        arm: () => geometryPool.getGeometry('BoxGeometry', 0.2, 0.2, 2)
    }
};

export function addStationAmenities(stationGroup, mainPlatform, secondaryPlatform, tangent, normal, platformHeight) {
    // Benches on main platform - batch creation
    const benchPositions = [];
    for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        benchPositions.push({
            position: mainPlatform.position.clone()
                .add(tangent.clone().multiplyScalar(i * 12))
                .add(normal.clone().multiplyScalar(2)),
            rotation: -Math.PI / 2
        });
    }
    
    benchPositions.forEach(({ position, rotation }) => {
        const bench = createBench();
        bench.position.copy(position);
        bench.position.y = platformHeight;
        bench.rotation.y = rotation;
        stationGroup.add(bench);
    });
    
    // Kiosk
    const kiosk = createKiosk();
    kiosk.position.copy(mainPlatform.position).add(normal.clone().multiplyScalar(3));
    kiosk.position.y = platformHeight;
    kiosk.lookAt(kiosk.position.clone().add(tangent));
    stationGroup.add(kiosk);
    
    // Vending machines - batch creation
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
    const seat = createMesh(amenityGeometries.bench.seat().clone(), materials.compartment);
    seat.position.y = 0.6;
    bench.add(seat);
    
    // Backrest
    const back = createMesh(amenityGeometries.bench.back().clone(), materials.compartment);
    back.position.set(0.5, 1.0, 0);
    bench.add(back);
    
    // Legs - reuse same geometry
    const legGeometry = amenityGeometries.bench.leg();
    for (let i of [-1.4, 1.4]) {
        for (let j of [-0.3, 0.3]) {
            const leg = createMesh(legGeometry.clone(), materials.railings);
            leg.position.set(j, 0.3, i);
            bench.add(leg);
        }
    }
    
    return bench;
}

function createKiosk() {
    const kiosk = new THREE.Group();
    
    // Main structure
    const main = createMesh(amenityGeometries.kiosk.main().clone(), materials.engine);
    main.position.y = 1.25;
    kiosk.add(main);
    
    // Window
    const window = createMesh(amenityGeometries.kiosk.window().clone(), materials.windows);
    window.position.set(0, 1.5, 1.01);
    kiosk.add(window);
    
    // Roof
    const roof = createMesh(amenityGeometries.kiosk.roof().clone(), materials.boiler);
    roof.position.y = 2.65;
    kiosk.add(roof);
    
    return kiosk;
}

function createVendingMachine() {
    const machine = new THREE.Group();
    
    // Main body
    const body = createMesh(amenityGeometries.vendingMachine.body().clone(), materials.cabin);
    body.position.y = 1;
    machine.add(body);
    
    // Display window
    const window = createMesh(amenityGeometries.vendingMachine.window().clone(), materials.wheel);
    window.position.set(0, 1.2, 0.41);
    machine.add(window);
    
    // Coin slot
    const slot = createMesh(amenityGeometries.vendingMachine.slot().clone(), materials.wheel);
    slot.position.set(0.3, 0.8, 0.41);
    machine.add(slot);
    
    return machine;
}

export function addStationLighting(stationGroup, mainPlatform, secondaryPlatform, tangent, normal, platformHeight) {
    // Platform lights - batch creation
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
    const polePost = createMesh(amenityGeometries.lightPole.pole().clone(), materials.railings);
    polePost.position.y = 3;
    pole.add(polePost);
    
    // Light fixture
    const fixture = createMesh(amenityGeometries.lightPole.fixture().clone(), materials.windows);
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
    const board = createMesh(amenityGeometries.sign.board().clone(), materials.cabin);
    sign.add(board);
    
    // Number display
    const numberDisplay = createMesh(amenityGeometries.sign.number().clone(), materials.windows);
    numberDisplay.position.z = 0.11;
    sign.add(numberDisplay);
    
    // Support post
    const post = createMesh(amenityGeometries.sign.post().clone(), materials.railings);
    post.position.y = -2.5;
    sign.add(post);
    
    return sign;
}

function createDirectionSign(text) {
    const sign = new THREE.Group();
    
    // Arrow sign
    const signBoard = createMesh(amenityGeometries.sign.direction().clone(), materials.treeLeaves);
    sign.add(signBoard);
    
    // Text area
    const textDisplay = createMesh(amenityGeometries.sign.text().clone(), materials.windows);
    textDisplay.position.z = 0.11;
    sign.add(textDisplay);
    
    // Support arm
    const arm = createMesh(amenityGeometries.sign.arm().clone(), materials.railings);
    arm.position.set(-3, 0, -1);
    sign.add(arm);
    
    return sign;
}