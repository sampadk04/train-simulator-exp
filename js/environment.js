// Global variables like 'radius', 'gauge', 'materials', 'scene', 'curve',
// 'CircleCurve', 'setObjectOnCurve', 'createMesh', 'THREE' are assumed to be
// defined in other files or globally available.
// Assumed functions from other files: createGround, createTrack, createStation, populateTrees,
// createHill, createTunnel, getTunnelBoundingBox

function setupEnvironment() {
    createGround();
    createTrack(); // Track needs to be there to visualize tunnel placement.
    
    const station = createStation();

    // --- Tunnel and Hill Setup ---
    const tunnelT = 0.75;
    const tunnelPositionOnCurve = curve.getPointAt(tunnelT);
    const tunnelTangent = curve.getTangentAt(tunnelT);

    // Create and position Hill
    const hill = createHill(70, 40); // hillRadius, hillHeight
    hill.position.copy(tunnelPositionOnCurve);
    // Adjust hill y based on its geometry's height for base at y=0
    // Assuming createHill returns a mesh with geometry parameters
    if (hill.geometry.parameters && hill.geometry.parameters.height) {
        hill.position.y = hill.geometry.parameters.height / 2;
    } else {
        // Fallback if height not directly on geometry.parameters (e.g. if group)
        // This might need adjustment based on actual createHill implementation details
        // For a CylinderGeometry, height is the third param.
        const geomParams = hill.geometry.parameters; // e.g. {radiusTop: 60, radiusBottom: 60, height: 30, ...}
        if (geomParams && typeof geomParams.height === 'number') {
             hill.position.y = geomParams.height / 2;
        } else {
            hill.position.y = 15; // Default fallback
        }
    }
    scene.add(hill);

    // Define Tunnel Shape
    const tunnelArchHeight = 8; // Height of the arch part from track level
    const tunnelBaseWidth = 10; // Width of the tunnel at track level (opening size)

    const tunnelShape = new THREE.Shape();
    // Start at bottom-left of the tunnel opening (relative to track center)
    tunnelShape.moveTo( -tunnelBaseWidth / 2, 0 );
    // Straight line up for the left wall
    tunnelShape.lineTo( -tunnelBaseWidth / 2, tunnelArchHeight * 0.8 );
    // Arc for the tunnel roof
    // absarc(centerX, centerY, radius, startAngle, endAngle, clockwise)
    // centerX, centerY are relative to the shape's origin (0,0 here)
    // For a semicircle on top of the vertical part:
    // CenterY will be tunnelArchHeight * 0.8
    // Radius will be tunnelBaseWidth / 2
    // StartAngle Math.PI (left side), EndAngle 0 (right side), Clockwise: true
    tunnelShape.absarc( 0, tunnelArchHeight * 0.8, tunnelBaseWidth / 2, Math.PI, 0, true );
    // Straight line down for the right wall
    tunnelShape.lineTo( tunnelBaseWidth / 2, 0 );
    // If you want a "floor" for the tunnel (e.g. if it's a cut-out rather than bore)
    // tunnelShape.lineTo( -tunnelBaseWidth / 2, 0 ); // Close path to form a base

    // Create and position Tunnel
    const tunnelProperties = {
        length: 80, // Increased length for better visibility with conical hill
        crossSectionShape: tunnelShape.getPoints(), // Use the points from the THREE.Shape
        material: materials.tunnelWall // Or materials.rock
    };
    const tunnel = createTunnel(tunnelProperties);
    tunnel.position.copy(tunnelPositionOnCurve);
    // Position the tunnel so the track (assumed y=1) runs through its defined opening.
    // If tunnelShape y=0 is track level, then tunnel.position.y = track's y-level.
    tunnel.position.y = 1;

    // Orient the tunnel to follow the track tangent
    const lookAtPosition = new THREE.Vector3().copy(tunnelPositionOnCurve).add(tunnelTangent);
    tunnel.lookAt(lookAtPosition);
    scene.add(tunnel);

    // Get bounding box for tree avoidance, with padding
    const tunnelBoundingBox = getTunnelBoundingBox(tunnel, 10);

    // Pass station and tunnel data to populateTrees
    populateTrees(station, tunnelBoundingBox);
    // --- End of Tunnel and Hill Setup ---
}
