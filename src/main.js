// Main application entry point
import { SIMULATION_CONFIG } from './core/constants.js';
import { setupScene, scene, camera, renderer, controls } from './core/scene.js';
import { setupEnvironment } from './components/environment.js';
import { setupTrain, updateTrainPosition, updateWheelRotationSpeed } from './components/train/train.js';
import { setupControls } from './ui/controls.js';
import { validateConfiguration } from './utils/index.js';

// Application state
let isRunning = false;
let t = SIMULATION_CONFIG.TRAIN.INITIAL_POSITION;
window.speed = SIMULATION_CONFIG.TRAIN.DEFAULT_SPEED;

// Make some state globally accessible for backward compatibility
window.isRunning = isRunning;
window.t = t;

function init() {
    // Validate configuration
    const validation = validateConfiguration(SIMULATION_CONFIG);
    if (!validation.isValid) {
        console.error('Configuration errors:', validation.errors);
        return;
    }

    try {
        // Initialize core systems
        setupScene();
        
        // Setup environment (ground, track, station, tunnel, trees)
        const environmentData = setupEnvironment();
        
        // Setup train
        setupTrain(t);
        
        // Setup UI controls
        setupControls();
        updateWheelRotationSpeed();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Start animation loop
        animate();
        
        console.log('Train Simulator initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize Train Simulator:', error);
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    if (window.isRunning) {
        window.t = (window.t + window.speed) % 1;
        t = window.t;
        updateTrainPosition(t);
    }
    
    renderer.render(scene, camera);
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", init);

// Export for debugging
export { init, animate };