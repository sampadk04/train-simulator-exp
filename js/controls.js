function updateCompartmentInfo() {
    document.getElementById('compartmentInfo').textContent = `Compartments: ${numCompartments}`;
    document.getElementById('removeCompartmentBtn').disabled = (numCompartments <= 1);
    document.getElementById('addCompartmentBtn').disabled = (numCompartments >= 20);
}

function setupControls() {
    const buttonConfig = {
        'startBtn': { action: () => { isRunning = true; }, enableSelf: false, disableOthers: ['stopBtn'] },
        'stopBtn': { action: () => { isRunning = false; }, enableSelf: false, disableOthers: ['startBtn'] },
        'addCompartmentBtn': { action: addCompartment },
        'removeCompartmentBtn': { action: removeCompartment }
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
