import { SIMULATION_CONFIG } from '../core/constants.js';
import { addCompartment, removeCompartment, getTrainState, updateWheelRotationSpeed } from '../components/train/train.js';

export function updateCompartmentInfo() {
    const trainState = getTrainState();
    document.getElementById('compartmentInfo').textContent = `Compartments: ${trainState.numCompartments}`;
    document.getElementById('removeCompartmentBtn').disabled = (trainState.numCompartments <= SIMULATION_CONFIG.TRAIN.MIN_COMPARTMENTS);
    document.getElementById('addCompartmentBtn').disabled = (trainState.numCompartments >= SIMULATION_CONFIG.TRAIN.MAX_COMPARTMENTS);
}

export function setupControls() {
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
            action: () => {
                addCompartment();
                updateCompartmentInfo();
            }
        },
        'removeCompartmentBtn': { 
            action: () => {
                removeCompartment();
                updateCompartmentInfo();
            }
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
    
    document.getElementById('speedSlider').addEventListener('input', function() {
        window.speed = parseFloat(this.value);
        document.getElementById('speedValue').textContent = (window.speed / 0.001).toFixed(1) + 'x';
        updateWheelRotationSpeed();
    });
    
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('startBtn').disabled = false;
    updateCompartmentInfo();
}