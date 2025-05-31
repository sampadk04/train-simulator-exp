// Core simulation constants
export const SIMULATION_CONFIG = {
    TRACK: {
        RADIUS: 100,
        GAUGE: 5
    },
    TRAIN: {
        DISTANCE_BETWEEN_COMPARTMENTS: 13,
        MIN_COMPARTMENTS: 1,
        MAX_COMPARTMENTS: 20,
        INITIAL_COMPARTMENTS: 3,
        INITIAL_POSITION: 0.25,
        DEFAULT_SPEED: 0.001
    },
    ENVIRONMENT: {
        GROUND_SIZE_MULTIPLIER: 4,
        TREE_COUNT: 40,
        TREE_HEIGHT_MIN: 8,
        TREE_HEIGHT_VARIATION: 7,
        SAFE_RADIUS_OFFSET: 15
    },
    STATION: {
        POSITION_T: 0.25,
        PLATFORM_HEIGHT: 1.2,
        MAIN_PLATFORM_WIDTH: 8,
        MAIN_PLATFORM_LENGTH: 80,
        SECONDARY_PLATFORM_WIDTH: 6,
        SECONDARY_PLATFORM_LENGTH: 60,
        FOOTPRINT_WIDTH: 80,
        FOOTPRINT_LENGTH: 120
    },
    TUNNEL: {
        LENGTH: 30,
        TUBE_RADIUS: 6,
        RADIAL_SEGMENTS: 12,
        TUBULAR_SEGMENTS: 32,
        CENTER_T: 0.75
    }
};

// Make some values globally accessible for backward compatibility
window.radius = SIMULATION_CONFIG.TRACK.RADIUS;
window.gauge = SIMULATION_CONFIG.TRACK.GAUGE;