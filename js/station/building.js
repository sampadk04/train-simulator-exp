// filepath: /Users/sampadk04/Desktop/Coding/Non_GitHub/Train_Simulator/js/station/building.js
// Terminal building components

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