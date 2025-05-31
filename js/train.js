let engine, compartments = [], connectors = [];
let numCompartments = 3;
const distanceBetween = 13;
const dt = distanceBetween / (2 * Math.PI * radius);
let wheelRotationSpeed = 0.002;

function createEngine() {
    const engine = new THREE.Group();
    
    const engineParts = [
        { type: 'CylinderGeometry', args: [2, 2, 10, 16], material: 'boiler', 
          position: {y: 4, z: 0}, rotation: {x: Math.PI/2} },
        { type: 'BoxGeometry', args: [4, 1, 12], material: 'engine', 
          position: {y: 1.5, z: -1} },
        { type: 'BoxGeometry', args: [3.8, 3, 4], material: 'cabin', 
          position: {y: 5.5, z: -3.5} },
        { type: 'BoxGeometry', args: [4, 0.5, 4.5], material: 'engine', 
          position: {y: 7.25, z: -3.5} },
        { type: 'PlaneGeometry', args: [1.5, 1], material: 'windows', 
          position: {y: 5.75, z: -5.51} },
        { type: 'CylinderGeometry', args: [0.7, 0.7, 2.5, 16], material: 'smokestack', 
          position: {y: 6.75, z: 3.5} },
        { type: 'CylinderGeometry', args: [1, 0.7, 0.5, 16], material: 'chimneyCap', 
          position: {y: 8.25, z: 3.5} },
        { type: 'CylinderGeometry', args: [1.5, 0.5, 2, 8], material: 'cowcatcher', 
          position: {y: 2, z: 6}, rotation: {x: Math.PI/2} },
        { type: 'SphereGeometry', args: [0.5, 8, 8], material: 'bell', 
          position: {y: 6, z: 1.5} },
        { type: 'BoxGeometry', args: [0.5, 0.5, 1], material: 'hitch', 
          position: {y: 2, z: 6} },
        { type: 'BoxGeometry', args: [0.5, 0.5, 1], material: 'hitch', 
          position: {y: 2, z: -6} }
    ];
    
    engineParts.forEach(part => {
        addToGroup(engine, part.type, part.args, part.material, part.position, part.rotation);
    });
    
    const sideWindowGeometry = new THREE.PlaneGeometry(1.5, 1);
    sideWindowGeometry.rotateY(Math.PI / 2);
    
    [-1.91, 1.91].forEach(x => {
        const sideWindow = createMesh(sideWindowGeometry.clone(), materials.windows);
        sideWindow.position.set(x, 5.75, -3.5);
        engine.add(sideWindow);
    });
    
    [-2.2, 2.2].forEach(x => {
        [-2.5, 0, 2.5].forEach((z, i) => {
            const wheelSize = i === 1 ? 1.5 : 1.2;
            const wheelGroup = new THREE.Group();
            const wheelGeometry = new THREE.CylinderGeometry(wheelSize, wheelSize, 0.6, 16);
            wheelGeometry.rotateZ(Math.PI / 2);
            wheelGroup.add(createMesh(wheelGeometry, materials.wheel));
            wheelGroup.position.set(x, wheelSize, z);
            engine.add(wheelGroup);
        });
    });
    
    scene.add(engine);
    return engine;
}

function createWheel(x, z) {
    const wheelGroup = new THREE.Group();
    const wheelGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 16);
    wheelGeometry.rotateZ(Math.PI / 2);
    wheelGroup.add(createMesh(wheelGeometry, materials.wheel));
    wheelGroup.position.set(x, 1, z);
    return wheelGroup;
}

function createCompartment() {
    const compartment = new THREE.Group();
    
    const bodyHeight = 4;
    const bodyWidth = 4;
    const bodyLength = 10;
    
    const bodyGeometry = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyLength);
    bodyGeometry.translate(0, 3, 0);
    compartment.add(createMesh(bodyGeometry, materials.compartment));
    
    const roofGeometry = new THREE.CylinderGeometry(bodyWidth/2, bodyWidth/2, bodyLength, 16, 1, false, 0, Math.PI);
    roofGeometry.rotateZ(Math.PI / 2);
    roofGeometry.rotateY(Math.PI / 2);
    roofGeometry.translate(0, 5, 0);
    compartment.add(createMesh(roofGeometry, materials.compartmentRoof));
    
    const trimWidth = 0.2;
    [-1, 1].forEach(side => {
        const trimGeometry = new THREE.BoxGeometry(trimWidth, trimWidth, bodyLength);
        trimGeometry.translate(side * (bodyWidth/2 - trimWidth/2), 5, 0);
        compartment.add(createMesh(trimGeometry, materials.metalTrim));
    });
    
    const windowWidth = 1.2;
    const windowHeight = 1.5;
    const windowSpacing = 2;
    const numWindows = 4;
    
    [-1, 1].forEach(side => {
        for (let i = 0; i < numWindows; i++) {
            const windowPos = (i - (numWindows - 1) / 2) * windowSpacing;
            const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
            windowGeometry.rotateY(Math.PI / 2 * side);
            windowGeometry.translate(side * (bodyWidth/2 + 0.01), 3.5, windowPos);
            compartment.add(createMesh(windowGeometry, materials.windows));
        }
    });
    
    [-bodyLength/2 - 0.5, bodyLength/2 + 0.5].forEach(z => {
        const platformGeometry = new THREE.BoxGeometry(bodyWidth, 0.5, 1);
        platformGeometry.translate(0, 1, z);
        compartment.add(createMesh(platformGeometry, materials.engine));
        
        const railHeight = 2;
        
        const topRailing = new THREE.CylinderGeometry(0.1, 0.1, bodyWidth, 8);
        topRailing.rotateX(Math.PI/2);
        topRailing.rotateZ(Math.PI/2);
        topRailing.translate(0, 2.5, z);
        compartment.add(createMesh(topRailing, materials.railings));
        
        [-bodyWidth/2 + 0.3, bodyWidth/2 - 0.3].forEach(x => {
            const supportGeometry = new THREE.CylinderGeometry(0.1, 0.1, railHeight, 8);
            supportGeometry.translate(x, 1.5 + railHeight/2, z);
            compartment.add(createMesh(supportGeometry, materials.railings));
        });
        
        const middleRailing = new THREE.CylinderGeometry(0.08, 0.08, bodyWidth - 0.6, 8);
        middleRailing.rotateX(Math.PI/2);
        middleRailing.rotateZ(Math.PI/2);
        middleRailing.translate(0, 1.8, z);
        compartment.add(createMesh(middleRailing, materials.railings));
    });
    
    [-bodyLength/2 + 0.51, bodyLength/2 - 0.51].forEach(z => {
        const doorGeometry = new THREE.PlaneGeometry(1.5, 3);
        doorGeometry.translate(0, 2.5, z);
        compartment.add(createMesh(doorGeometry, materials.engine));
        
        const handleGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        handleGeometry.translate(0.4, 2.5, z - 0.01);
        compartment.add(createMesh(handleGeometry, materials.metalTrim));
    });
    
    [-bodyLength/2 - 1, bodyLength/2 + 1].forEach(z => {
        const hitch = createMesh(new THREE.BoxGeometry(0.5, 0.5, 1), materials.hitch);
        hitch.position.set(0, 1.8, z);
        compartment.add(hitch);
    });
    
    const undercarriageGeometry = new THREE.BoxGeometry(bodyWidth - 0.5, 0.5, bodyLength - 2);
    undercarriageGeometry.translate(0, 1, 0);
    compartment.add(createMesh(undercarriageGeometry, materials.engine));
    
    const wheelRadius = 1;
    [-2.2, 2.2].forEach(x => {
        [-3, 3].forEach(z => {
            const wheelGroup = new THREE.Group();
            const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.5, 16);
            wheelGeometry.rotateZ(Math.PI / 2);
            wheelGroup.add(createMesh(wheelGeometry, materials.wheel));
            wheelGroup.position.set(x, wheelRadius, z);
            compartment.add(wheelGroup);
        });
    });
    
    scene.add(compartment);
    return compartment;
}

function createConnector() {
    const connector = createMesh(
        new THREE.CylinderGeometry(0.2, 0.2, 2.5, 8).rotateZ(Math.PI / 2),
        materials.connector
    );
    scene.add(connector);
    return connector;
}

function setupTrain() {
    engine = createEngine();
    
    for (let i = 0; i < numCompartments; i++) {
        compartments.push(createCompartment());
        connectors.push(createConnector());
    }
    
    // Initial positioning of train components
    setObjectOnCurve(engine, curve, t, 1.5);
    
    compartments.forEach((compartment, i) => {
        const tComp = ((t - (i + 1) * dt) % 1 + 1) % 1;
        setObjectOnCurve(compartment, curve, tComp, 1.5);
    });
    
    updateConnectorPositions();
}

function updateConnectorPositions() {
    compartments.forEach((compartment, i) => {
        if (i < connectors.length) {
            const frontPos = i === 0 
                ? engine.localToWorld(new THREE.Vector3(0, 2, -6))
                : compartments[i-1].localToWorld(new THREE.Vector3(0, 1.8, -6));
            
            const backPos = compartment.localToWorld(new THREE.Vector3(0, 1.8, 6));
            connectors[i].position.copy(frontPos).lerp(backPos, 0.5);
            connectors[i].lookAt(backPos);
        }
    });
}

function updateTrainPosition(t) {
    setObjectOnCurve(engine, curve, t, 1.5);
    rotateWheels(engine);
    
    compartments.forEach((compartment, i) => {
        const tComp = ((t - (i + 1) * dt) % 1 + 1) % 1;
        setObjectOnCurve(compartment, curve, tComp, 1.5);
        rotateWheels(compartment);
    });
    
    updateConnectorPositions();
}

function updateWheelRotationSpeed() {
    wheelRotationSpeed = window.speed * 2;
}

function addCompartment() {
    if (numCompartments >= 20) return;
    
    const newCompartment = createCompartment();
    compartments.push(newCompartment);
    
    const newConnector = createConnector();
    connectors.push(newConnector);
    
    const lastIndex = compartments.length - 1;
    const tComp = ((t - (lastIndex + 1) * dt) % 1 + 1) % 1;
    setObjectOnCurve(newCompartment, curve, tComp, 1.5);
    
    const frontPos = lastIndex === 0 
        ? engine.localToWorld(new THREE.Vector3(0, 2, -6))
        : compartments[lastIndex-1].localToWorld(new THREE.Vector3(0, 1.8, -6));
    
    const backPos = newCompartment.localToWorld(new THREE.Vector3(0, 1.8, 6));
    newConnector.position.copy(frontPos).lerp(backPos, 0.5);
    newConnector.lookAt(backPos);
    
    numCompartments++;
    updateCompartmentInfo();
}

function removeCompartment() {
    if (numCompartments <= 1) return;
    
    const lastCompartment = compartments.pop();
    const lastConnector = connectors.pop();
    
    scene.remove(lastCompartment);
    scene.remove(lastConnector);
    
    numCompartments--;
    updateCompartmentInfo();
}

function rotateWheels(obj) {
    obj.traverse(child => {
        if (child instanceof THREE.Group && 
            child.children.length > 0 && 
            child.children[0].material === materials.wheel) {
            child.children[0].rotation.x += wheelRotationSpeed;
        }
    });
}
