import { SIMULATION_CONFIG } from '../../core/constants.js';
import { scene, curve } from '../../core/scene.js';
import { materials } from '../../core/materials.js';

class TunnelPathCurve extends THREE.Curve {
    constructor(mainCurve, tStart, tEnd, pathElevation) {
        super();
        this.mainCurve = mainCurve;
        this.tStart = tStart;
        this.tEnd = tEnd;
        
        // Improved arc length calculation
        if (tEnd >= tStart) {
            this.arcLength = tEnd - tStart;
        } else {
            // Handle wrap-around case (tunnel crosses t=0 point)
            this.arcLength = (1 - tStart) + tEnd;
        }
        
        // Ensure minimum arc length to avoid geometry issues
        if (this.arcLength < 0.01) {
            console.warn("Tunnel arc length too small, adjusting to minimum");
            this.arcLength = 0.01;
        }
        
        this.pathElevation = pathElevation;
    }

    getPoint(t, optionalTarget = new THREE.Vector3()) {
        // t is from 0 to 1 for this segment
        let actualT;
        if (this.tEnd >= this.tStart) {
            actualT = this.tStart + t * this.arcLength;
        } else {
            // Handle wrap-around
            actualT = (this.tStart + t * this.arcLength) % 1;
        }
        
        const point = this.mainCurve.getPoint(actualT, optionalTarget);
        point.y = this.pathElevation;
        return point;
    }
    
    // Add tangent method for better tube generation
    getTangent(t, optionalTarget = new THREE.Vector3()) {
        let actualT;
        if (this.tEnd >= this.tStart) {
            actualT = this.tStart + t * this.arcLength;
        } else {
            actualT = (this.tStart + t * this.arcLength) % 1;
        }
        
        return this.mainCurve.getTangent(actualT, optionalTarget);
    }
}

export function createTunnel(station, trackRadius) {
    const { TUBE_RADIUS, RADIAL_SEGMENTS, TUBULAR_SEGMENTS, CENTER_T } = SIMULATION_CONFIG.TUNNEL;
    
    // Make tunnel twice as long
    const LENGTH = SIMULATION_CONFIG.TUNNEL.LENGTH * 2;
    
    const deltaTTunnel = LENGTH / (2 * Math.PI * trackRadius);
    const tunnelHalfArc = deltaTTunnel / 2;
    
    // Position tunnel farther away from station
    let tunnelStartT = CENTER_T - tunnelHalfArc;
    let tunnelEndT = CENTER_T + tunnelHalfArc;
    
    // Normalize t values to [0, 1] range
    tunnelStartT = ((tunnelStartT % 1) + 1) % 1;
    tunnelEndT = ((tunnelEndT % 1) + 1) % 1;
    
    // The path for the TubeGeometry should be elevated so the bottom of the tube touches the ground
    const tunnelPathElevation = TUBE_RADIUS * 0.8;
    const tunnelCurve = new TunnelPathCurve(curve, tunnelStartT, tunnelEndT, tunnelPathElevation);
    
    // Ensure tunnelCurve has a valid length for TubeGeometry
    if (tunnelCurve.arcLength <= 0) {
        console.error("Tunnel curve has zero or negative arc length. Tunnel not created.");
        return null;
    }
    
    try {
        const tunnelGeometry = new THREE.TubeGeometry(
            tunnelCurve,
            TUBULAR_SEGMENTS,
            TUBE_RADIUS,
            RADIAL_SEGMENTS,
            false
        );
        
        // Create improved tunnel material with better visibility
        const tunnelMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x404040,
            side: THREE.DoubleSide,
            transparent: false,
            opacity: 1.0
        });
        
        const tunnelMesh = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
        scene.add(tunnelMesh);
        
        return {
            startT: tunnelStartT,
            endT: tunnelEndT,
            pathRadius: trackRadius,
            outerWidth: TUBE_RADIUS * 2,
            length: LENGTH,
            mesh: tunnelMesh
        };
    } catch (error) {
        console.error("Error creating tunnel geometry:", error);
        return null;
    }
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