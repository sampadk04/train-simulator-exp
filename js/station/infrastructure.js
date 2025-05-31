// filepath: /Users/sampadk04/Desktop/Coding/Non_GitHub/Train_Simulator/js/station/infrastructure.js
// Station infrastructure components like entrances, bridges, and walkways

function createEntranceArea(tangent, normal, label) {
    const entrance = new THREE.Group();
    
    // Entrance plaza
    const plazaGeometry = new THREE.BoxGeometry(20, 0.2, 15);
    const plazaMaterial = new THREE.MeshLambertMaterial({ color: 0xD3D3D3 });
    const plaza = new THREE.Mesh(plazaGeometry, plazaMaterial);
    plaza.position.y = 0.1;
    entrance.add(plaza);
    
    // Entrance archway
    const archGeometry = new THREE.BoxGeometry(12, 8, 2);
    const archMaterial = new THREE.MeshLambertMaterial({ color: 0xE6E6FA });
    const arch = new THREE.Mesh(archGeometry, archMaterial);
    arch.position.y = 4;
    entrance.add(arch);
    
    // Arch opening
    const openingGeometry = new THREE.BoxGeometry(8, 6, 2.1);
    const openingMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const opening = new THREE.Mesh(openingGeometry, openingMaterial);
    opening.position.y = 3;
    entrance.add(opening);
    
    // Sign above arch
    const signGeometry = new THREE.BoxGeometry(10, 2, 0.5);
    const signMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.y = 8.5;
    entrance.add(sign);
    
    // Turnstiles
    for (let i = -1; i <= 1; i++) {
        const turnstileGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 8);
        const turnstileMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const turnstile = new THREE.Mesh(turnstileGeometry, turnstileMaterial);
        turnstile.position.set(i * 2.5, 1.5, -1);
        entrance.add(turnstile);
    }
    
    return entrance;
}

function createWalkwayBridge() {
    const bridge = new THREE.Group();
    
    // Bridge deck
    const deckGeometry = new THREE.BoxGeometry(3, 0.3, 20);
    const deckMaterial = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 });
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    deck.position.y = 4;
    bridge.add(deck);
    
    // Railings
    const railingGeometry = new THREE.BoxGeometry(0.1, 1.2, 20);
    const railingMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
    
    for (let side of [-1.5, 1.5]) {
        const railing = new THREE.Mesh(railingGeometry, railingMaterial);
        railing.position.set(side, 4.6, 0);
        bridge.add(railing);
    }
    
    // Support beams
    for (let i = -8; i <= 8; i += 4) {
        const beamGeometry = new THREE.BoxGeometry(0.2, 4, 0.2);
        const beamMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(0, 2, i);
        bridge.add(beam);
    }
    
    return bridge;
}