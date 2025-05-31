import { SIMULATION_CONFIG } from '../../core/constants.js';
import { scene, curve } from '../../core/scene.js';
import { createTerminalBuilding, createPlatformCanopy } from './building.js';
import { createEntranceArea, createWalkwayBridge } from './infrastructure.js';
import { addStationAmenities, addStationLighting, addStationSignage } from './amenities.js';

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

export function createStation() {
    const { POSITION_T, PLATFORM_HEIGHT, MAIN_PLATFORM_WIDTH, MAIN_PLATFORM_LENGTH, 
            SECONDARY_PLATFORM_WIDTH, SECONDARY_PLATFORM_LENGTH, FOOTPRINT_WIDTH, FOOTPRINT_LENGTH } = SIMULATION_CONFIG.STATION;
    
    const stationPosition = curve.getPoint(POSITION_T);
    const stationGroup = new THREE.Group();
    
    const tangent = curve.getTangent(POSITION_T);
    const normal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    
    // Main Platform (closest to track)
    const mainPlatform = createPlatform(MAIN_PLATFORM_WIDTH, MAIN_PLATFORM_LENGTH, PLATFORM_HEIGHT);
    mainPlatform.position.copy(stationPosition).add(
        normal.clone().multiplyScalar(SIMULATION_CONFIG.TRACK.GAUGE/2 + MAIN_PLATFORM_WIDTH/2 + 1)
    );
    mainPlatform.position.y = PLATFORM_HEIGHT/2;
    mainPlatform.lookAt(mainPlatform.position.clone().add(tangent));
    stationGroup.add(mainPlatform);
    
    // Secondary Platform
    const secondaryPlatform = createPlatform(SECONDARY_PLATFORM_WIDTH, SECONDARY_PLATFORM_LENGTH, PLATFORM_HEIGHT);
    secondaryPlatform.position.copy(mainPlatform.position).add(
        normal.clone().multiplyScalar(MAIN_PLATFORM_WIDTH/2 + SECONDARY_PLATFORM_WIDTH/2 + 3)
    );
    secondaryPlatform.lookAt(secondaryPlatform.position.clone().add(tangent));
    stationGroup.add(secondaryPlatform);
    
    // Terminal Building
    const terminalBuilding = createTerminalBuilding(tangent, normal);
    terminalBuilding.position.copy(mainPlatform.position).add(
        normal.clone().multiplyScalar(MAIN_PLATFORM_WIDTH/2 + 25)
    );
    terminalBuilding.lookAt(terminalBuilding.position.clone().add(tangent));
    stationGroup.add(terminalBuilding);
    
    // Platform Canopy
    const canopy = createPlatformCanopy(MAIN_PLATFORM_LENGTH - 10);
    canopy.position.copy(mainPlatform.position);
    canopy.position.y = PLATFORM_HEIGHT + 6;
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
    
    // Connecting Bridges
    const bridge1 = createWalkwayBridge();
    bridge1.position.copy(mainPlatform.position).add(
        tangent.clone().multiplyScalar(-20)
    ).add(normal.clone().multiplyScalar(MAIN_PLATFORM_WIDTH/2 + 1.5));
    bridge1.lookAt(bridge1.position.clone().add(normal));
    stationGroup.add(bridge1);
    
    const bridge2 = createWalkwayBridge();
    bridge2.position.copy(mainPlatform.position).add(
        tangent.clone().multiplyScalar(20)
    ).add(normal.clone().multiplyScalar(MAIN_PLATFORM_WIDTH/2 + 1.5));
    bridge2.lookAt(bridge2.position.clone().add(normal));
    stationGroup.add(bridge2);
    
    // Station Amenities, Lighting, and Signage
    addStationAmenities(stationGroup, mainPlatform, secondaryPlatform, tangent, normal, PLATFORM_HEIGHT);
    addStationLighting(stationGroup, mainPlatform, secondaryPlatform, tangent, normal, PLATFORM_HEIGHT);
    addStationSignage(stationGroup, mainPlatform, tangent, normal, PLATFORM_HEIGHT);
    
    scene.add(stationGroup);
    
    return {
        position: stationPosition,
        tangent: tangent,
        normal: normal,
        width: FOOTPRINT_WIDTH,
        length: FOOTPRINT_LENGTH,
        t: POSITION_T
    };
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