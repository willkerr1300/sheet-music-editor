const WebSocket = require('ws');
const PORT = process.env.PORT || 1234;
const wss = new WebSocket.Server({ port: PORT });

const rooms = new Map();

wss.on('connection', (conn, req) => {
    // Parse room from URL: ws://localhost:1234/roomName
    // If undefined, default to 'default'
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

console.log('Simple Yjs signaling server running at port 1234');
