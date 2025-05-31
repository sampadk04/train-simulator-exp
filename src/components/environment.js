// Main environment setup that coordinates all components
import { createGround } from './environment/ground.js';
import { createTrack } from './track/track.js';
import { createStation } from './station/station.js';
import { createTunnel, isInTunnelArea } from './environment/tunnel.js';
import { populateTrees } from './environment/trees.js';
import { SIMULATION_CONFIG } from '../core/constants.js';

// Function to check if point is in station area (needs to be available for trees)
function isInStationArea(x, z, station) {
    if (!station) return false;
    
    const toPoint = new THREE.Vector3(x - station.position.x, 0, z - station.position.z);
    const alongTrack = toPoint.dot(station.tangent);
    const fromTrack = toPoint.dot(station.normal);
    
    return Math.abs(alongTrack) < station.length/2 &&
           fromTrack > -station.width/4 &&
           fromTrack < station.width;
}

export function setupEnvironment() {
    // Create ground and track
    createGround();
    createTrack();
    
    // Create station
    const station = createStation();
    
    // Create tunnel
    const tunnelData = createTunnel(station, SIMULATION_CONFIG.TRACK.RADIUS);
    
    // Populate trees (avoiding station and tunnel areas)
    populateTrees(station, tunnelData, isInStationArea, isInTunnelArea);
    
    return { station, tunnelData };
}