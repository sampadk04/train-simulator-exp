import { SIMULATION_CONFIG } from './constants.js';
import { trigCache } from '../utils/index.js';

// Scene, camera, renderer, and controls
export let scene, camera, renderer, controls;

// Reusable vectors to prevent garbage collection
const _tempVector3 = new THREE.Vector3();
const _tempVector3_2 = new THREE.Vector3();
const _tempMatrix4 = new THREE.Matrix4();

// Curve for train movement with optimized calculations
export class CircleCurve extends THREE.Curve {
    constructor(radius) {
        super();
        this.radius = radius;
        // Cache 2π for performance
        this._twoPi = 2 * Math.PI;
    }
    
    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const theta = this._twoPi * t;
        // Use cached trig functions for better performance
        return optionalTarget.set(
            this.radius * trigCache.cos(t),
            0,
            this.radius * trigCache.sin(t)
        );
    }
    
    getTangent(t, optionalTarget = new THREE.Vector3()) {
        return optionalTarget.set(-trigCache.sin(t), 0, trigCache.cos(t)).normalize();
    }
    
    getNormal(t, optionalTarget = new THREE.Vector3()) {
        return optionalTarget.set(-trigCache.cos(t), 0, -trigCache.sin(t)).normalize();
    }
}

export const curve = new CircleCurve(SIMULATION_CONFIG.TRACK.RADIUS);

export function setupScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    camera.position.set(0, 60, 150);
    camera.lookAt(SIMULATION_CONFIG.TRACK.RADIUS/2, 0, 0);
    
    // Optimized renderer settings
    renderer = new THREE.WebGLRenderer({ 
        antialias: false, // Disable for better performance
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 500;

    // Lighting
    scene.add(new THREE.AmbientLight(0x404040, 0.4));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Make globally accessible for backward compatibility
    window.scene = scene;
    window.camera = camera;
    window.curve = curve;
    
    return scene;
}

// Utility functions
export function createMesh(geometry, material) {
    return new THREE.Mesh(geometry, material);
}

// Batch operations for better performance
export function addObjectsToScene(objects) {
    objects.forEach(obj => scene.add(obj));
}

export function removeObjectsFromScene(objects) {
    objects.forEach(obj => scene.remove(obj));
}

export function addToGroup(group, geometryType, args, material, position, rotation = null) {
    const geometry = new THREE[geometryType](...args);
    if (rotation) {
        geometry.rotateX(rotation.x || 0);
        geometry.rotateY(rotation.y || 0);
        geometry.rotateZ(rotation.z || 0);
    }
    geometry.translate(position.x || 0, position.y || 0, position.z || 0);
    group.add(createMesh(geometry, material));
}

export function setObjectOnCurve(obj, curve, t, yOffset = 0) {
    // Use reusable vectors to prevent garbage collection
    const point = curve.getPoint(t, _tempVector3);
    const tangent = curve.getTangent(t, _tempVector3_2);
    obj.position.copy(point).setY(point.y + yOffset);
    
    const up = new THREE.Vector3(0, 1, 0);
    const forward = tangent;
    const right = new THREE.Vector3().crossVectors(up, forward).normalize();
    up.crossVectors(forward, right).normalize();
    
    obj.quaternion.setFromRotationMatrix(_tempMatrix4.makeBasis(right, up, forward));
}

// Optimized batch curve positioning
export function setMultipleObjectsOnCurve(objects, curve, startT, spacing, yOffset = 0) {
    objects.forEach((obj, index) => {
        const t = ((startT - index * spacing) % 1 + 1) % 1;
        setObjectOnCurve(obj, curve, t, yOffset);
    });
}

// Make utility functions globally accessible
window.createMesh = createMesh;
window.addToGroup = addToGroup;
window.setObjectOnCurve = setObjectOnCurve;