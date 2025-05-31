// Main application entry point
import { SIMULATION_CONFIG } from './core/constants.js';
import { setupScene, scene, camera, renderer, controls } from './core/scene.js';
import { setupEnvironment } from './components/environment.js';
import { setupTrain, updateTrainPosition, updateWheelRotationSpeed } from './components/train/train.js';
import { setupControls } from './ui/controls.js';
import { validateConfiguration, PerformanceMonitor, throttle } from './utils/index.js';

// Application state
let isRunning = false;
let t = SIMULATION_CONFIG.TRAIN.INITIAL_POSITION;
window.speed = SIMULATION_CONFIG.TRAIN.DEFAULT_SPEED;

// Performance monitoring
const performanceMonitor = new PerformanceMonitor();
let lastFrameTime = 0;
const targetFrameTime = 1000 / 60; // 60 FPS

// Make some state globally accessible for backward compatibility
window.isRunning = isRunning;
window.t = t;

// Throttled render function for performance
const throttledRender = throttle(() => {
    renderer.render(scene, camera);
}, 16); // ~60 FPS

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
        
        // Handle window resize with debouncing
        const handleResize = throttle(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, 100);
        
        window.addEventListener('resize', handleResize);
        
        // Start animation loop
        animate();
        
        console.log('Train Simulator initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize Train Simulator:', error);
    }
}

function animate(currentTime = 0) {
    requestAnimationFrame(animate);
    
    // Frame rate limiting for consistent performance
    const deltaTime = currentTime - lastFrameTime;
    if (deltaTime < targetFrameTime) {
        return;
    }
    lastFrameTime = currentTime;
    
    // Update performance monitor
    performanceMonitor.update();
    
    // Update controls with dampening
    controls.update();
    
    // Update train position if running
    if (window.isRunning) {
        window.t = (window.t + window.speed) % 1;
        t = window.t;
        updateTrainPosition(t);
    }
    
    // Adaptive quality based on performance
    if (performanceMonitor.isPerformanceLow() && renderer.getPixelRatio() > 1) {
        renderer.setPixelRatio(1); // Reduce pixel ratio for better performance
        console.log('Reduced pixel ratio for better performance');
    }
    
    // Render scene
    renderer.render(scene, camera);
    
    // Optional: Display FPS for debugging (only in development)
    // Since we're in a browser environment, we'll use a simple flag or skip this entirely
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDevelopment) {
        const fps = performanceMonitor.getFPS();
        if (fps < 30) {
            console.warn(`Low FPS detected: ${fps}`);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", init);

// Export for debugging
export { init, animate, performanceMonitor };