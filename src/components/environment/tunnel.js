import { SIMULATION_CONFIG } from '../../core/constants.js';
import { scene, curve } from '../../core/scene.js';
import { materials } from '../../core/materials.js';

class TunnelPathCurve extends THREE.Curve {
    constructor(mainCurve, tStart, tEnd, pathElevation) {
        super();
        this.mainCurve = mainCurve;
        this.tStart = tStart;
        this.tEnd = tEnd;
        // Calculate arcLength, handling wrap-around
        this.arcLength = (this.tEnd - this.tStart + (this.tEnd < this.tStart ? 1 : 0)) % 1;
        if (this.arcLength === 0 && this.tStart !== this.tEnd) {
             this.arcLength = 1; // Full circle, though not expected for a segment
        } else if (this.arcLength === 0 && this.tStart === this.tEnd) {
            // This case means zero length, TubeGeometry might not like it.
        }
        this.pathElevation = pathElevation;
    }

    getPoint(t, optionalTarget = new THREE.Vector3()) {
        // t is from 0 to 1 for this segment
        const actualT = (this.tStart + t * this.arcLength + 1) % 1;
        const point = this.mainCurve.getPoint(actualT, optionalTarget);
        point.y = this.pathElevation; // Elevate the path for the tunnel tube
        return point;
    }
}

export function createTunnel(station, trackRadius) {
    const { LENGTH, TUBE_RADIUS, RADIAL_SEGMENTS, TUBULAR_SEGMENTS, CENTER_T } = SIMULATION_CONFIG.TUNNEL;
    
    const deltaTTunnel = LENGTH / (2 * Math.PI * trackRadius);
    const tunnelHalfArc = deltaTTunnel / 2;
    
    // Position tunnel farther away from station
    const tunnelStartT = (CENTER_T - tunnelHalfArc + 1) % 1;
    const tunnelEndT = (CENTER_T + tunnelHalfArc + 1) % 1;
    
    // The path for the TubeGeometry should be elevated so the bottom of the tube is at y=0
    const tunnelPathElevation = TUBE_RADIUS;
    const tunnelCurve = new TunnelPathCurve(curve, tunnelStartT, tunnelEndT, tunnelPathElevation);
    
    // Ensure tunnelCurve has a valid length for TubeGeometry
    if (tunnelCurve.arcLength <= 0) {
        console.warn("Tunnel curve has zero or negative arc length. Tunnel not created.");
        return null;
    }
    
    const tunnelGeometry = new THREE.TubeGeometry(
        tunnelCurve,
        TUBULAR_SEGMENTS,
        TUBE_RADIUS,
        RADIAL_SEGMENTS,
        false
    );
    const tunnelMesh = new THREE.Mesh(tunnelGeometry, materials.tunnel);
    scene.add(tunnelMesh);
    
    return {
        startT: tunnelStartT,
        endT: tunnelEndT,
        pathRadius: trackRadius,
        outerWidth: TUBE_RADIUS * 2,
        length: LENGTH
    };
}

export function isInTunnelArea(x, z, tunnelData) {
    if (!tunnelData) return false;

    // Calculate the angle of the point (x,z) and convert to t value (0 to 1)
    const pointT = (Math.atan2(z, x) / (2 * Math.PI) + 1) % 1;
    const distFromCenter = Math.sqrt(x*x + z*z);

    let inArc = false;
    if (tunnelData.startT <= tunnelData.endT) {
        // Normal case: startT < endT
        inArc = pointT >= tunnelData.startT && pointT <= tunnelData.endT;
    } else {
        // Wrap-around case: startT > endT (e.g., tunnel crosses t=0 point)
        inArc = pointT >= tunnelData.startT || pointT <= tunnelData.endT;
    }

    // Check if the point is within the radial bounds of the tunnel's footprint
    const inRadialBounds = Math.abs(distFromCenter - tunnelData.pathRadius) < tunnelData.outerWidth / 2;
    
    return inArc && inRadialBounds;
}