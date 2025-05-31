const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer, controls;
const radius = 100, gauge = 5;

function setupScene() {
    camera.position.set(0, 60, 150);
    camera.lookAt(radius/2, 0, 0);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 500;

    scene.add(new THREE.AmbientLight(0x404040));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return scene;
}

function createMesh(geometry, material) {
    return new THREE.Mesh(geometry, material);
}

function addToGroup(group, geometryType, args, material, position, rotation = null) {
    const geometry = new THREE[geometryType](...args);
    if (rotation) {
        geometry.rotateX(rotation.x || 0);
        geometry.rotateY(rotation.y || 0);
        geometry.rotateZ(rotation.z || 0);
    }
    geometry.translate(position.x || 0, position.y || 0, position.z || 0);
    group.add(createMesh(geometry, materials[material]));
}

function setObjectOnCurve(obj, curve, t, yOffset = 0) {
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    obj.position.copy(point).setY(point.y + yOffset);
    
    const up = new THREE.Vector3(0, 1, 0);
    const forward = tangent;
    const right = new THREE.Vector3().crossVectors(up, forward).normalize();
    up.crossVectors(forward, right).normalize();
    
    obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, forward));
}
