import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface NoteData {
    keys: string[];
    duration: string;
}

export const useSheetMusic = () => {
    const [notes, setNotes] = useState<NoteData[]>([]);
    const ydocRef = useRef<Y.Doc>(new Y.Doc());
    const providerRef = useRef<WebsocketProvider | null>(null);
    const notesArrayRef = useRef<Y.Array<NoteData> | null>(null);

    useEffect(() => {
        const doc = ydocRef.current;

        // Connect to the WebSocket server
        // Using a specific room name "sheet-music-demo"
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:1234';
        const provider = new WebsocketProvider(wsUrl, 'sheet-music-demo', doc);
        providerRef.current = provider;

        const yNotes = doc.getArray<NoteData>('notes');
        notesArrayRef.current = yNotes;

        // Initial Sync
        setNotes(yNotes.toArray());

        // Listen for updates
        yNotes.observe(() => {
            setNotes(yNotes.toArray());
        });

        return () => {
            provider.disconnect();
        };
    }, []);

    const addNote = (note: NoteData) => {
        if (notesArrayRef.current) {
            // Wrap in transaction for atomicity (optional for single push)
            ydocRef.current.transact(() => {
                notesArrayRef.current?.push([note]);
            });
        }
    };

    const clearNotes = () => {
        if (notesArrayRef.current) {
            ydocRef.current.transact(() => {
                notesArrayRef.current?.delete(0, notesArrayRef.current.length);
            });
        }
    };

    return { notes, addNote, clearNotes };
};
