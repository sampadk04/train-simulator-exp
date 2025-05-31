# Train Simulator - Modular 3D Architecture

A high-performance 3D train simulator built with Three.js and ES6 modules, featuring optimized rendering and interactive controls.

## 🚀 Quick Start

### Prerequisites
- Modern browser with ES6 module support
- Local web server (required for ES6 modules)

### Running the Application

**Python (Recommended):**
```bash
cd Train_Simulator
python -m http.server 8000
# Open http://localhost:8000
```

**Node.js:**
```bash
npm install -g http-server
http-server
```

**VS Code Live Server:**
Install Live Server extension → Right-click `index.html` → "Open with Live Server"

## 🎮 Controls
- **Start/Stop**: Control train movement
- **Add/Remove Compartments**: Modify train length (1-20 cars)
- **Speed Slider**: Adjust train speed (0.1x to 3x)
- **Mouse**: Orbit camera around the scene

## 📁 Project Structure

```
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # UI styling
└── src/
    ├── main.js             # Application entry point
    ├── core/               # Core systems
    │   ├── constants.js    # Configuration constants
    │   ├── geometry-pool.js # Geometry pooling system
    │   ├── materials.js    # Material management
    │   └── scene.js        # Scene setup and utilities
    ├── components/         # Main features
    │   ├── environment.js  # Environment coordinator
    │   ├── environment/    # Environmental elements
    │   │   ├── ground.js   # Ground and track bed
    │   │   ├── trees.js    # Procedural tree generation
    │   │   └── tunnel.js   # Tunnel system
    │   ├── station/        # Station complex
    │   │   ├── amenities.js     # Benches, signs, lighting
    │   │   ├── building.js      # Terminal building
    │   │   ├── infrastructure.js # Bridges, entrances
    │   │   └── station.js       # Station coordinator
    │   ├── track/
    │   │   └── track.js    # Rails and sleepers
    │   └── train/
    │       └── train.js    # Engine and compartments
    ├── ui/
    │   └── controls.js     # User interface controls
    └── utils/
        └── index.js        # Utility functions and performance monitoring
```

## ⚡ Key Optimizations

- **Geometry Pooling**: Reuses common geometries to reduce memory
- **Material Lazy Loading**: Shared material instances
- **Performance Monitoring**: Real-time FPS tracking with adaptive quality
- **Cached Calculations**: Pre-computed trigonometric values
- **Throttled UI**: Smooth controls without performance impact

## 🛠️ Configuration

Modify settings in `src/core/constants.js`:

```javascript
export const SIMULATION_CONFIG = {
    TRACK: { RADIUS: 100, GAUGE: 5 },
    TRAIN: { MAX_COMPARTMENTS: 20, DEFAULT_SPEED: 0.001 },
    ENVIRONMENT: { TREE_COUNT: 40, GROUND_SIZE_MULTIPLIER: 4 }
};
```

## ✨ Features

- Modular ES6 architecture
- Interactive 3D train with dynamic compartments
- Detailed station with platforms, building, and amenities
- Procedural tree placement avoiding track/station areas
- Tunnel system with collision detection
- Real-time performance monitoring
- Memory-efficient resource management

## 🐛 Troubleshooting

- **Module errors**: Use HTTP(S) server, not file:// protocol
- **Performance issues**: Check console for FPS warnings
- **Import errors**: Verify relative paths in modules

Built with Three.js • ES6 Modules • Performance-Optimized