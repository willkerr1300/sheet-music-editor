const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 1234;

// Serve static files from the React build (dist)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Create HTTP server (combining Express handling and WS handling)
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = new Map();

wss.on('connection', (conn, req) => {
    // Parse room from URL: ws://host/roomName
    const roomName = req.url.slice(1) || 'default';
    console.log(`New connection to room: ${roomName}`);

    if (!rooms.has(roomName)) {
        rooms.set(roomName, new Set());
    }
    const room = rooms.get(roomName);
    room.add(conn);

    conn.on('message', (message, isBinary) => {
        // Broadcast to all others in the same room
        room.forEach(c => {
            if (c !== conn && c.readyState === WebSocket.OPEN) {
                c.send(message, { binary: isBinary });
            }
        });
    });

    conn.on('close', () => {
        room.delete(conn);
        if (room.size === 0) {
            rooms.delete(roomName);
        }
        console.log(`Connection closed from room: ${roomName}`);
    });

    conn.on('error', (err) => {
        console.error(`Connection error in room ${roomName}:`, err);
    });
});

// Fallback: For any request not handled (e.g., refresh on a route), serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Serving static files from ${distPath}`);
});
