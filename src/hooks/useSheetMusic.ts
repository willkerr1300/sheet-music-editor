import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface NoteData {
    keys: string[];
    duration: string;
}

export const useSheetMusic = (roomName: string = 'sheet-music-demo') => {
    const [notes, setNotes] = useState<NoteData[]>([]);
    const ydocRef = useRef<Y.Doc>(new Y.Doc());
    const providerRef = useRef<WebsocketProvider | null>(null);

    useEffect(() => {
        const ydoc = ydocRef.current;
        const yNotes = ydoc.getArray<NoteData>('notes');

        // Connect to WebSocket Provider with dynamic room name
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:1234';

        // Clean up previous provider if it exists
        if (providerRef.current) {
            providerRef.current.destroy();
        }

        const provider = new WebsocketProvider(wsUrl, roomName, ydoc);
        providerRef.current = provider;

        // Sync initial state
        setNotes(yNotes.toArray());

        // Listen for updates
        const observeHandler = () => {
            setNotes(yNotes.toArray());
        };
        yNotes.observe(observeHandler);

        return () => {
            yNotes.unobserve(observeHandler);
            provider.destroy();
            providerRef.current = null;
        };
    }, [roomName]); // Re-run when roomName changes

    const addNote = (note: NoteData) => {
        const yNotes = ydocRef.current.getArray<NoteData>('notes');
        yNotes.push([note]);
    };

    const clearNotes = () => {
        const yNotes = ydocRef.current.getArray<NoteData>('notes');
        yNotes.delete(0, yNotes.length);
    };

    return { notes, addNote, clearNotes };
};
