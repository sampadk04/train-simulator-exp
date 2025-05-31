// Assuming 'THREE', 'scene', 'materials', 'curve', 'station', 'radius' (trackRadius) are accessible.

class TunnelPathCurve extends THREE.Curve {
    constructor(mainCurve, tStart, tEnd, pathElevation) {
        super();
        this.mainCurve = mainCurve;
        this.tStart = tStart;
        this.tEnd = tEnd;
        // Calculate arcLength, handling wrap-around
        this.arcLength = (this.tEnd - this.tStart + (this.tEnd < this.tStart ? 1 : 0)) % 1;
        if (this.arcLength === 0 && this.tStart !== this.tEnd) { // Should not happen if tStart and tEnd are different
             this.arcLength = 1; // Full circle, though not expected for a segment
        } else if (this.arcLength === 0 && this.tStart === this.tEnd) {
            // This case means zero length, TubeGeometry might not like it.
            // However, getPoint would always return tStart.
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

function createTunnel(scene, materials, curve, station, trackRadius) {
    const tunnelLength = 30; // Reduced from 80 to be more proportionate
    const tunnelTubeRadius = 6; // Reduced from 10 to be smaller
    const tunnelRadialSegments = 12; // Smoothness of the tube's cross-section
    const tunnelTubularSegments = 32; // Reduced segments for better performance
    const deltaTTunnel = tunnelLength / (2 * Math.PI * trackRadius);
    const tunnelHalfArc = deltaTTunnel / 2;
    
    // Position tunnel farther away from station
    // Station is at t=0.25, so place tunnel at opposite side (t=0.75)
    const tunnelCenterT = 0.75; // 270 degrees around the track, opposite from station
    const tunnelStartT = (tunnelCenterT - tunnelHalfArc + 1) % 1;
    const tunnelEndT = (tunnelCenterT + tunnelHalfArc + 1) % 1;
    
    // The path for the TubeGeometry should be elevated so the bottom of the tube is at y=0
    const tunnelPathElevation = tunnelTubeRadius;
    const tunnelCurve = new TunnelPathCurve(curve, tunnelStartT, tunnelEndT, tunnelPathElevation);
    // Ensure tunnelCurve has a valid length for TubeGeometry
    if (tunnelCurve.arcLength <= 0) {
        console.warn("Tunnel curve has zero or negative arc length. Tunnel not created.");
        return null;
    }
    
    const tunnelGeometry = new THREE.TubeGeometry(
        tunnelCurve,          // path
        tunnelTubularSegments, // tubularSegments
        tunnelTubeRadius,     // radius
        tunnelRadialSegments, // radialSegments,
        false                 // closed
    );
    const tunnelMesh = new THREE.Mesh(tunnelGeometry, materials.tunnel);
    scene.add(tunnelMesh);
    return {
        startT: tunnelStartT,
        endT: tunnelEndT,
        pathRadius: trackRadius, // This is the radius of the main track curve
        outerWidth: tunnelTubeRadius * 2, // Footprint width for tree avoidance
        length: tunnelLength // Actual length of the tunnel segment
    };
}

function isInTunnelArea(x, z, tunnelData) {
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
