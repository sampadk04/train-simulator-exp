import { SIMULATION_CONFIG } from '../core/constants.js';
import { addCompartment, removeCompartment, getTrainState, updateWheelRotationSpeed } from '../components/train/train.js';
import { throttle, debounce } from '../utils/index.js';

export function updateCompartmentInfo() {
    const trainState = getTrainState();
    document.getElementById('compartmentInfo').textContent = `Compartments: ${trainState.numCompartments}`;
    document.getElementById('removeCompartmentBtn').disabled = (trainState.numCompartments <= SIMULATION_CONFIG.TRAIN.MIN_COMPARTMENTS);
    document.getElementById('addCompartmentBtn').disabled = (trainState.numCompartments >= SIMULATION_CONFIG.TRAIN.MAX_COMPARTMENTS);
}

export function setupControls() {
    // Throttled functions for better performance
    const throttledAddCompartment = throttle(() => {
        addCompartment();
        updateCompartmentInfo();
    }, 300);

    const throttledRemoveCompartment = throttle(() => {
        removeCompartment();
        updateCompartmentInfo();
    }, 300);

    // Debounced speed update for smooth performance
    const debouncedSpeedUpdate = debounce((value) => {
        window.speed = parseFloat(value);
        document.getElementById('speedValue').textContent = (window.speed / 0.001).toFixed(1) + 'x';
        updateWheelRotationSpeed();
    }, 50);

    const buttonConfig = {
        'startBtn': { 
            action: () => { window.isRunning = true; }, 
            enableSelf: false, 
            disableOthers: ['stopBtn'] 
        },
        'stopBtn': { 
            action: () => { window.isRunning = false; }, 
            enableSelf: false, 
            disableOthers: ['startBtn'] 
        },
        'addCompartmentBtn': { 
            action: throttledAddCompartment
        },
        'removeCompartmentBtn': { 
            action: throttledRemoveCompartment
        }
    };
    
    Object.entries(buttonConfig).forEach(([id, config]) => {
        const button = document.getElementById(id);
        button.addEventListener('click', () => {
            config.action();
            
            if (config.enableSelf === false) button.disabled = true;
            if (config.disableOthers) {
                config.disableOthers.forEach(otherId => {
                    document.getElementById(otherId).disabled = false;
                });
            }
        });
    });
    
    // Use input event with debouncing for smoother slider response
    document.getElementById('speedSlider').addEventListener('input', function() {
        debouncedSpeedUpdate(this.value);
    });
    
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('startBtn').disabled = false;
    updateCompartmentInfo();
}