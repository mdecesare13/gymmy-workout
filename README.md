# 🏋️‍♂️ Gymmy

**Gymmy** is a premium, iOS-styled Progressive Web App (PWA) designed to serve as an offline-first, distraction-free companion in the gym. 

This project was built from scratch and polished using **Antigravity** (Google DeepMind's advanced agentic coding AI assistant) in pair programming sessions with **mdecesare13** driving live testing, functional validations, and deployment.

---

## 🚀 Live Demo & Deployment

*   **Production Deployment**: [https://antigrav-gym-app.vercel.app](https://antigrav-gym-app.vercel.app)
*   **GitHub Repository**: [mdecesare13/gymmy-workout](https://github.com/mdecesare13/gymmy-workout)

---

## ✨ Core Features

### 📅 Week Calendar & Workout Previews
*   An **Apple Health-style horizontal week selector strip** at the top of the Today tab.
*   Previews scheduled lifts, cardio, or rest days.
*   Each day has a dedicated status icon (`🏆` for completed, `💤` for rest, `🏃‍♂️` for cardio, `💪` for lifting).
*   Allows starting any future or past day's workout out-of-order, logging it to history under today's date but marking the targeted day as completed.
*   Renders real-world weekday markers with a distinct red dot.

### 💾 Persistent Active Sessions & Tab Switching
*   Active session progress is synced dynamically to `localStorage` under `useWorkoutStore.js`.
*   You can close your PWA container, refresh the browser, or browse the **Library** / **Stats** tabs mid-workout without losing logged sets, weights, or checkmarks.

### 🗂️ Accordion-Style Exercise Logging
*   Active logging cards collapse into clean accordion strips to reduce visual clutter.
*   Check off sets, toggle form guides, or swap exercises inside the active panel.
*   Features a satisfying **Save & Next** button that completes unfinished sets using default fallbacks (based on muscle group standards and PR references) and expands the next incomplete workout in the lineup.

### 🎨 High-Fidelity SVG Dual-View Posture Guides
*   Custom dual-view canvas showing side-by-side **Side View** and **Front/Top View** animations simultaneously.
*   Color-coded components:
    *   **Stationary Equipment**: Slate Gray (`#4b5563`) (benches, cages, pulley columns).
    *   **Weights & Cables**: Bright Achievement Gold (`#ffd700`) (barbells, dumbbell plates, sliding pulleys, cables).
    *   **Human Skeleton**: Foremost limbs are White (`#ffffff`), trailing back limbs are Red (`#ff3b30`) for 3D depth, with highlighted target muscles glowing under tension.
*   Includes incline movements (`incline_press`, `incline_fly`, `incline_curl`, `incline_row`) showing correct bench angles (30°, 35°, 45°).

### 🏃‍♂️ Custom Interactive Cardio Logging
*   Features a cardio track deck for Run, Bike, Elliptical, and Row.
*   Logs duration, distance, and performance text notes.
*   Renders responsive cardio-specific stick figure animations.

### 🔁 Muscle Rotation Scheduler & fatigue Prevention
*   Distributes focus regions (chest, back, shoulders, legs, abs, bis, tris) into customized lifting splits.
*   Rotates target muscle groups week-over-week to keep routines fresh.
*   Filters out recently done exercises to prevent workout fatigue.
*   **Split Builder Drag & Drop**: Swap workouts between any two days in the builder tab using desktop drag-and-drop or mobile tap-to-swap fallbacks.

### 📈 Stats, backups & CSV Restoration
*   Chronological logging feed displaying strength sets and custom cardio cards.
*   **Export CSV**: Compiles performance logs into standard RFC 4180 files.
*   **Import CSV**: Merges backups back into local history, safely avoiding duplicates.

---

## 🛠️ Technology Stack
*   **Core Shell**: React (Vite)
*   **Styles**: Vanilla CSS tailored to iOS design guidelines (frosted glass glassmorphism, spring-haptic button transforms, safe area coverage).
*   **Assets**: Inline customized dynamic SVG assets.
*   **PWA Setup**: Custom web app manifest, offline service worker, iOS cover tags.

---

## 📦 Local Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/mdecesare13/gymmy-workout.git
    cd gymmy-workout
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run development server**:
    ```bash
    npm run dev
    ```
4.  **Build production package**:
    ```bash
    npm run build
    ```
