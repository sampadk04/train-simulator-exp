import { SIMULATION_CONFIG } from '../../core/constants.js';
import { scene, curve } from '../../core/scene.js';
import { materials } from '../../core/materials.js';
import { createMesh, addToGroup, setObjectOnCurve } from '../../core/scene.js';
import { geometryPool, CommonGeometries } from '../../core/geometry-pool.js';
import { disposeObject3D } from '../../utils/index.js';

// Train state
let engine, compartments = [], connectors = [];
let numCompartments = SIMULATION_CONFIG.TRAIN.INITIAL_COMPARTMENTS;
const distanceBetween = SIMULATION_CONFIG.TRAIN.DISTANCE_BETWEEN_COMPARTMENTS;
const dt = distanceBetween / (2 * Math.PI * SIMULATION_CONFIG.TRACK.RADIUS);
let wheelRotationSpeed = 0.002;

// Cached configurations for performance
const enginePartsConfig = [
    { type: 'CylinderGeometry', args: [2, 2, 10, 16], material: 'boiler', 
      position: {y: 4, z: 0}, rotation: {x: Math.PI/2} },
    { type: 'BoxGeometry', args: [4, 1, 12], material: 'engine', 
      position: {y: 1.5, z: -1} },
    // Engine hood - main front section
    { type: 'BoxGeometry', args: [3.5, 2.5, 6], material: 'engine', 
      position: {y: 3.5, z: 3} },
    // Hood top section with slight taper
    { type: 'BoxGeometry', args: [3.2, 1, 5.5], material: 'boiler', 
      position: {y: 5.25, z: 3} },
    // Hood side vents
    { type: 'BoxGeometry', args: [0.2, 1.5, 4], material: 'metalTrim', 
      position: {y: 3.5, z: 3, x: 1.6} },
    { type: 'BoxGeometry', args: [0.2, 1.5, 4], material: 'metalTrim', 
      position: {y: 3.5, z: 3, x: -1.6} },
    // Hood front grille
    { type: 'BoxGeometry', args: [2.5, 1.8, 0.3], material: 'metalTrim', 
      position: {y: 3.5, z: 5.85} },
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

// Cached wheel references for performance
let engineWheelRefs = [];
let compartmentWheelRefs = [];

function createEngine() {
    const engine = new THREE.Group();
    engineWheelRefs = [];
    
    enginePartsConfig.forEach(part => {
        const geometry = geometryPool.getGeometry(part.type, ...part.args);
        const material = materials[part.material];
        const mesh = createMesh(geometry.clone(), material);
        
        if (part.rotation) {
            mesh.geometry.rotateX(part.rotation.x || 0);
            mesh.geometry.rotateY(part.rotation.y || 0);
            mesh.geometry.rotateZ(part.rotation.z || 0);
        }
        mesh.position.set(part.position.x || 0, part.position.y || 0, part.position.z || 0);
        engine.add(mesh);
    });
    
    // Hood headlights - reuse geometry
    const headlightGeometry = geometryPool.getGeometry('CylinderGeometry', 0.3, 0.3, 0.2, 16);
    const lensGeometry = geometryPool.getGeometry('CylinderGeometry', 0.25, 0.25, 0.1, 16);
    
    [-1.2, 1.2].forEach(x => {
        const headlight = createMesh(headlightGeometry.clone(), materials.metalTrim);
        headlight.geometry.rotateX(Math.PI / 2);
        headlight.position.set(x, 4.2, 5.9);
        engine.add(headlight);
        
        const lens = createMesh(lensGeometry.clone(), materials.windows);
        lens.geometry.rotateX(Math.PI / 2);
        lens.position.set(x, 4.2, 6.0);
        engine.add(lens);
    });
    
    // Side windows - reuse geometry
    const sideWindowGeometry = geometryPool.getGeometry('PlaneGeometry', 1.5, 1);
    
    [-1.91, 1.91].forEach(x => {
        const sideWindow = createMesh(sideWindowGeometry.clone(), materials.windows);
        sideWindow.geometry.rotateY(Math.PI / 2);
        sideWindow.position.set(x, 5.75, -3.5);
        engine.add(sideWindow);
    });
    
    // Wheels with cached references
    [-2.2, 2.2].forEach(x => {
        [-2.5, 0, 2.5].forEach((z, i) => {
            const wheelSize = i === 1 ? 1.5 : 1.2;
            const wheelGroup = new THREE.Group();
            const wheelGeometry = geometryPool.getGeometry('CylinderGeometry', wheelSize, wheelSize, 0.6, 16);
            const wheelMesh = createMesh(wheelGeometry.clone(), materials.wheel);
            wheelMesh.geometry.rotateZ(Math.PI / 2);
            wheelGroup.add(wheelMesh);
            wheelGroup.position.set(x, wheelSize, z);
            engine.add(wheelGroup);
            
            // Cache wheel reference for rotation
            engineWheelRefs.push(wheelMesh);
        });
    });
    
    scene.add(engine);
    return engine;
}

function createCompartment() {
    const compartment = new THREE.Group();
    const compartmentWheels = [];
    
    const bodyHeight = 4;
    const bodyWidth = 4;
    const bodyLength = 10;
    
    // Reuse common geometries
    const bodyGeometry = geometryPool.getGeometry('BoxGeometry', bodyWidth, bodyHeight, bodyLength);
    const bodyMesh = createMesh(bodyGeometry.clone(), materials.compartment);
    bodyMesh.position.set(0, 3, 0);
    compartment.add(bodyMesh);
    
    const roofGeometry = geometryPool.getGeometry('CylinderGeometry', bodyWidth/2, bodyWidth/2, bodyLength, 16, 1, false, 0, Math.PI);
    const roofMesh = createMesh(roofGeometry.clone(), materials.compartmentRoof);
    roofMesh.geometry.rotateZ(Math.PI / 2);
    roofMesh.geometry.rotateY(Math.PI / 2);
    roofMesh.position.set(0, 5, 0);
    compartment.add(roofMesh);
    
    // Trim
    const trimWidth = 0.2;
    const trimGeometry = geometryPool.getGeometry('BoxGeometry', trimWidth, trimWidth, bodyLength);
    [-1, 1].forEach(side => {
        const trim = createMesh(trimGeometry.clone(), materials.metalTrim);
        trim.position.set(side * (bodyWidth/2 - trimWidth/2), 5, 0);
        compartment.add(trim);
    });
    
    // Windows - batch creation
    const windowWidth = 1.2;
    const windowHeight = 1.5;
    const windowSpacing = 2;
    const numWindows = 4;
    const windowGeometry = geometryPool.getGeometry('PlaneGeometry', windowWidth, windowHeight);
    
    [-1, 1].forEach(side => {
        for (let i = 0; i < numWindows; i++) {
            const windowPos = (i - (numWindows - 1) / 2) * windowSpacing;
            const window = createMesh(windowGeometry.clone(), materials.windows);
            window.geometry.rotateY(Math.PI / 2 * side);
            window.position.set(side * (bodyWidth/2 + 0.01), 3.5, windowPos);
            compartment.add(window);
        }
    });
    
    // Platforms and railings
    [-bodyLength/2 - 0.5, bodyLength/2 + 0.5].forEach(z => {
        const platformGeometry = geometryPool.getGeometry('BoxGeometry', bodyWidth, 0.5, 1);
        const platformMesh = createMesh(platformGeometry.clone(), materials.engine);
        platformMesh.position.set(0, 1, z);
        compartment.add(platformMesh);
        
        const railHeight = 2;
        
        const topRailingGeometry = geometryPool.getGeometry('CylinderGeometry', 0.1, 0.1, bodyWidth, 8);
        const topRailingMesh = createMesh(topRailingGeometry.clone(), materials.railings);
        topRailingMesh.geometry.rotateX(Math.PI/2);
        topRailingMesh.geometry.rotateZ(Math.PI/2);
        topRailingMesh.position.set(0, 2.5, z);
        compartment.add(topRailingMesh);
        
        [-bodyWidth/2 + 0.3, bodyWidth/2 - 0.3].forEach(x => {
            const supportGeometry = geometryPool.getGeometry('CylinderGeometry', 0.1, 0.1, railHeight, 8);
            const supportMesh = createMesh(supportGeometry.clone(), materials.railings);
            supportMesh.position.set(x, 1.5 + railHeight/2, z);
            compartment.add(supportMesh);
        });
        
        const middleRailingGeometry = geometryPool.getGeometry('CylinderGeometry', 0.08, 0.08, bodyWidth - 0.6, 8);
        const middleRailingMesh = createMesh(middleRailingGeometry.clone(), materials.railings);
        middleRailingMesh.geometry.rotateX(Math.PI/2);
        middleRailingMesh.geometry.rotateZ(Math.PI/2);
        middleRailingMesh.position.set(0, 1.8, z);
        compartment.add(middleRailingMesh);
    });
    
    // Doors
    [-bodyLength/2 + 0.51, bodyLength/2 - 0.51].forEach(z => {
        const doorGeometry = geometryPool.getGeometry('PlaneGeometry', 1.5, 3);
        const doorMesh = createMesh(doorGeometry.clone(), materials.engine);
        doorMesh.position.set(0, 2.5, z);
        compartment.add(doorMesh);
        
        const handleGeometry = geometryPool.getGeometry('SphereGeometry', 0.15, 8, 8);
        const handleMesh = createMesh(handleGeometry.clone(), materials.metalTrim);
        handleMesh.position.set(0.4, 2.5, z - 0.01);
        compartment.add(handleMesh);
    });
    
    // Hitches
    [-bodyLength/2 - 1, bodyLength/2 + 1].forEach(z => {
        const hitchGeometry = geometryPool.getGeometry('BoxGeometry', 0.5, 0.5, 1);
        const hitchMesh = createMesh(hitchGeometry.clone(), materials.hitch);
        hitchMesh.position.set(0, 1.8, z);
        compartment.add(hitchMesh);
    });
    
    // Undercarriage
    const undercarriageGeometry = geometryPool.getGeometry('BoxGeometry', bodyWidth - 0.5, 0.5, bodyLength - 2);
    const undercarriageMesh = createMesh(undercarriageGeometry.clone(), materials.engine);
    undercarriageMesh.position.set(0, 1, 0);
    compartment.add(undercarriageMesh);
    
    // Wheels with cached references for performance
    const wheelRadius = 1;
    const wheelGeometry = geometryPool.getGeometry('CylinderGeometry', wheelRadius, wheelRadius, 0.5, 16);
    [-2.2, 2.2].forEach(x => {
        [-3, 3].forEach(z => {
            const wheelGroup = new THREE.Group();
            const wheelMesh = createMesh(wheelGeometry.clone(), materials.wheel);
            wheelMesh.geometry.rotateZ(Math.PI / 2);
            wheelGroup.add(wheelMesh);
            wheelGroup.position.set(x, wheelRadius, z);
            compartment.add(wheelGroup);
            
            // Cache wheel reference
            compartmentWheels.push(wheelMesh);
        });
    });
    
    compartmentWheelRefs.push(compartmentWheels);
    scene.add(compartment);
    return compartment;
}

function createConnector() {
    const connectorGeometry = geometryPool.getGeometry('CylinderGeometry', 0.2, 0.2, 2.5, 8);
    const connector = createMesh(connectorGeometry.clone(), materials.connector);
    connector.geometry.rotateZ(Math.PI / 2);
    scene.add(connector);
    return connector;
}

export function setupTrain(t) {
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

export function updateConnectorPositions() {
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

export function updateTrainPosition(t) {
    setObjectOnCurve(engine, curve, t, 1.5);
    rotateWheelsOptimized();
    
    compartments.forEach((compartment, i) => {
        const tComp = ((t - (i + 1) * dt) % 1 + 1) % 1;
        setObjectOnCurve(compartment, curve, tComp, 1.5);
    });
    
    updateConnectorPositions();
}

export function updateWheelRotationSpeed() {
    wheelRotationSpeed = window.speed * 2;
}

export function addCompartment() {
    if (numCompartments >= SIMULATION_CONFIG.TRAIN.MAX_COMPARTMENTS) return;
    
    const newCompartment = createCompartment();
    compartments.push(newCompartment);
    
    const newConnector = createConnector();
    connectors.push(newConnector);
    
    const lastIndex = compartments.length - 1;
    const tComp = ((window.t - (lastIndex + 1) * dt) % 1 + 1) % 1;
    setObjectOnCurve(newCompartment, curve, tComp, 1.5);
    
    const frontPos = lastIndex === 0 
        ? engine.localToWorld(new THREE.Vector3(0, 2, -6))
        : compartments[lastIndex-1].localToWorld(new THREE.Vector3(0, 1.8, -6));
    
    const backPos = newCompartment.localToWorld(new THREE.Vector3(0, 1.8, 6));
    newConnector.position.copy(frontPos).lerp(backPos, 0.5);
    newConnector.lookAt(backPos);
    
    numCompartments++;
    return numCompartments;
}

export function removeCompartment() {
    if (numCompartments <= SIMULATION_CONFIG.TRAIN.MIN_COMPARTMENTS) return;
    
    const lastCompartment = compartments.pop();
    const lastConnector = connectors.pop();
    
    // Proper cleanup
    disposeObject3D(lastCompartment);
    disposeObject3D(lastConnector);
    
    // Remove wheel references
    compartmentWheelRefs.pop();
    
    numCompartments--;
    return numCompartments;
}

// Optimized wheel rotation using cached references
function rotateWheelsOptimized() {
    // Rotate engine wheels
    engineWheelRefs.forEach(wheel => {
        wheel.rotation.x += wheelRotationSpeed;
    });
    
    // Rotate compartment wheels
    compartmentWheelRefs.forEach(wheelGroup => {
        wheelGroup.forEach(wheel => {
            wheel.rotation.x += wheelRotationSpeed;
        });
    });
}

// Legacy function for backward compatibility
function rotateWheels(obj) {
    obj.traverse(child => {
        if (child instanceof THREE.Group && 
            child.children.length > 0 && 
            child.children[0].material === materials.wheel) {
            child.children[0].rotation.x += wheelRotationSpeed;
        }
    });
}

export function getTrainState() {
    return {
        numCompartments,
        engine,
        compartments,
        connectors
    };
}