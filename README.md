# Train Simulator - Modular Architecture

A 3D train simulator built with Three.js, refactored into a modular ES6 architecture for better maintainability and extensibility.

## 🚀 Quick Start

### Prerequisites
- Modern browser with ES6 module support (Chrome 61+, Firefox 60+, Safari 10.1+)
- Local web server (required for ES6 modules)

### Running the Application

#### Option 1: Using Python (Recommended)
```bash
# Navigate to the project directory
cd Train_Simulator

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Open browser to http://localhost:8000
```

#### Option 2: Using Node.js
```bash
# Install a simple server globally
npm install -g http-server

# Run in project directory
http-server

# Open browser to displayed URL (usually http://localhost:8080)
```

#### Option 3: Using VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Controls
- **Start/Stop**: Control train movement
- **Add/Remove Compartments**: Modify train length (1-20 cars)
- **Speed Slider**: Adjust train speed (0.1x to 3x)
- **Mouse**: Orbit camera around the scene

## 📁 Project Structure

```
src/
├── core/                 # Core systems (scene, materials, constants)
├── components/           # Main features
│   ├── environment/      # Ground, trees, tunnel
│   ├── station/          # Platform, building, amenities
│   ├── track/            # Rails and sleepers
│   └── train/            # Engine and compartments
├── ui/                   # User interface controls
└── utils/                # Helper functions
```

## ✨ Key Features

- **Modular Architecture**: Clean separation of concerns with ES6 modules
- **3D Environment**: Detailed train, station, tunnel, and procedural trees
- **Interactive Controls**: Real-time train manipulation and camera control
- **Configurable**: Centralized settings in `src/core/constants.js`

## 🛠️ Configuration

Modify simulation parameters in `src/core/constants.js`:

```javascript
export const SIMULATION_CONFIG = {
    TRACK: { RADIUS: 100, GAUGE: 5 },
    TRAIN: { MAX_COMPARTMENTS: 20, DEFAULT_SPEED: 0.001 },
    ENVIRONMENT: { TREE_COUNT: 40, GROUND_SIZE_MULTIPLIER: 4 }
};
```

## 🔧 Development

### Adding Features
1. Create module in appropriate `src/components/` folder
2. Use ES6 import/export syntax
3. Update coordinator files as needed

### Common Patterns
```javascript
// Named exports for utilities
export function createTrack() {}

// Import specific functions
import { setupScene, curve } from './core/scene.js';
```

## 🐛 Troubleshooting

**Module loading errors**: Ensure you're serving from HTTP(S), not file:// protocol
**Import path errors**: Check relative paths from each module's location
**Performance issues**: Reduce `TREE_COUNT` in constants.js for lower-end devices

## 🚀 Future Enhancements

The modular structure supports:
- Multiple train types and complex track layouts
- Physics simulation and weather effects
- Multiplayer functionality and save/load features

---

Built with Three.js • ES6 Modules • Modern Web Standards