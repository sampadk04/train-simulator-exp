# Product Requirement Document: Train Simulator

## 1. Overview

The Train Simulator is an interactive 3D web application (Three.js) simulating a train on a circular track. Users control its movement, speed, and compartment count. It showcases 3D graphics, animation, and user interaction.

## 2. Goals

*   Provide an engaging 3D train simulation.
*   Allow user interaction with train operations and configuration.
*   Demonstrate Three.js capabilities for 3D web graphics.
*   Serve as an extensible platform and educational example.

## 3. Target Audience

*   Casual simulation enthusiasts.
*   Three.js and 3D web graphics learners.
*   3D modeling and animation hobbyists.

## 4. Core Features

### 4.1. 3D Scene & Rendering
*   Perspective camera with OrbitControls.
*   Ambient and directional lighting.

### 4.2. Train Simulation
*   Detailed 3D models: steam locomotive engine, dynamic compartments, and connectors.
*   Smooth movement on a circular track with synchronized wheel animation.

### 4.3. Track System
*   Circular track with rails and sleepers.

### 4.4. Environment
*   Ground plane, track bed.
*   Randomly placed 3D trees (avoiding track/station).
*   3D station model: platform, building (roof, windows, door), benches, sign.

### 4.5. User Interaction & Controls
*   Buttons: Start/Stop train, Add/Remove Compartment (1-20).
*   Speed slider with value display.
*   Compartment count display.
*   Context-aware UI (button enable/disable).

## 5. User Interface (UI)

Overlay panel (top-left) with:
*   Control buttons (Start, Stop, Add Compartment, Remove Compartment).
*   Compartment count text.
*   Speed slider and current speed multiplier display.

## 6. Technical Specifications

### 6.1. Technology
*   HTML5, CSS3, JavaScript (ES5/ES6).
*   Three.js (r132) with `OrbitControls.js`.

### 6.2. Code Structure (Modular JS files)
*   `materials.js`: 3D object materials.
*   `curves.js`: Train path definition.
*   `scene.js`: Scene setup, camera, renderer, utilities.
*   `environment.js`: Environmental elements creation.
*   `train.js`: Train logic (engine, compartments, connectors).
*   `controls.js`: UI interactions.
*   `main.js`: Initialization and animation loop.

### 6.3. Object Creation
*   Three.js primitive geometries and `THREE.Group`.

### 6.4. Animation
*   `requestAnimationFrame` loop for train position and wheel rotation.

## 7. Key Parameters

*   **Track:** Radius 100 units, gauge 5 units.
*   **Environment:** 40 trees (8-15 units height), station at t=0.25 on track.
*   **Train:** Compartments spaced ~13 units, 1-20 compartments.

## 8. Potential Future Enhancements

*   ES6 Module system.
*   Complex track layouts, advanced physics, sound effects.
*   Multiple train types, interactive track elements.
*   Day/night cycle, weather effects.
*   Improved graphics (PBR, shadows).
*   Collision detection, user-configurable environment.
*   Scenario-based gameplay, persistent state.
