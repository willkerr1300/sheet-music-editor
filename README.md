# Real-Time Collaborative Sheet Music Editor

**Live Demo:** [https://sheet-music-editor.onrender.com/](https://sheet-music-editor.onrender.com/)

A real-time, collaborative sheet music editor built with **React**, **TypeScript**, and **WebSocket**. It enables multiple users to compose music simultaneously on a shared digital score, featuring a full Grand Staff (Treble + Bass) and automatic note distribution.



##  Key Features

*   **Real-Time Collaboration**: Uses **Yjs CRDTs** (Conflict-free Replicated Data Types) to ensure eventual consistency across all connected clients without central locking.
*   **Grand Staff Rendering**: Automatically renders both Treble and Bass staves using **VexFlow**, intelligently routing notes to the correct staff based on pitch.
*   **Optimized Networking**: Implements a custom binary-encoded WebSocket protocol that reduces payload size by **~65%** compared to standard JSON.
*   **High-Performance Rendering**: Features a differential rendering engine that updates only modified measures, maintaining **60 FPS** during active collaboration.

## Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Rendering**: VexFlow (Music Notation), Canvas/SVG
*   **State / Sync**: Yjs (CRDT), y-websocket
*   **Backend**: Node.js, Express, WebSocket (ws)
*   **Deployment**: Render

## Local Development

1.  **Clone the repository**
    ```bash
    git clone https://github.com/willkerr1300/sheet-music-editor.git
    cd sheet-music-editor
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    This runs both the Backend (Port 1234) and Frontend (Port 5173) concurrently.
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

## Deployment

This project is configured for deployment on **Render** as a single web service.

*   **Build Command**: `npm install && npm run build`
*   **Start Command**: `node server/index.cjs`

## Testing

Run the test suite (Vitest + React Testing Library):

```bash
npm test
```
