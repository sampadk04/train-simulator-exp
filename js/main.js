let isRunning = false;
let t = 0.25;
// Make speed globally accessible
window.speed = 0.001;

function init() {
    setupScene();
    setupEnvironment();
    setupTrain();
    setupControls();
    updateWheelRotationSpeed();
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    if (isRunning) {
        t = (t + window.speed) % 1;
        updateTrainPosition(t);
    }
    
    renderer.render(scene, camera);
}

document.addEventListener("DOMContentLoaded", init);
