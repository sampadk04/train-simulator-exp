window.radius = 100;
window.gauge = 5;

class CircleCurve extends THREE.Curve {
    constructor(radius) {
        super();
        this.radius = radius;
    }
    
    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const theta = 2 * Math.PI * t;
        return optionalTarget.set(
            this.radius * Math.cos(theta),
            0,
            this.radius * Math.sin(theta)
        );
    }
    
    getTangent(t, optionalTarget = new THREE.Vector3()) {
        const theta = 2 * Math.PI * t;
        return optionalTarget.set(-Math.sin(theta), 0, Math.cos(theta)).normalize();
    }
    
    getNormal(t, optionalTarget = new THREE.Vector3()) {
        const theta = 2 * Math.PI * t;
        return optionalTarget.set(-Math.cos(theta), 0, -Math.sin(theta)).normalize();
    }
}

const curve = new CircleCurve(radius);
