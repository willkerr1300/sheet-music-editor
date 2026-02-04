import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface NoteData {
    keys: string[];
    duration: string;
}

export const useSheetMusic = (roomName: string = 'sheet-music-demo') => {
    const [notes, setNotes] = useState<NoteData[]>([]);
    const [timeSignature, setTimeSignature] = useState<string>('4/4');
    const ydocRef = useRef<Y.Doc>(new Y.Doc());
    const providerRef = useRef<WebsocketProvider | null>(null);

    useEffect(() => {
        const ydoc = ydocRef.current;
        const yNotes = ydoc.getArray<NoteData>('notes');
        const yMeta = ydoc.getMap<string>('meta');

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
        const remoteTS = yMeta.get('timeSignature');
        if (remoteTS) {
            setTimeSignature(remoteTS);
        } else {
            // Initialize if empty
            if (!yMeta.has('timeSignature')) {
                yMeta.set('timeSignature', '4/4');
            }
        }

        // Listen for updates
        const observeNotes = () => {
            setNotes(yNotes.toArray());
        };
        const observeMeta = () => {
            const ts = yMeta.get('timeSignature');
            if (ts) setTimeSignature(ts);
        };

        yNotes.observe(observeNotes);
        yMeta.observe(observeMeta);

        return () => {
            yNotes.unobserve(observeNotes);
            yMeta.unobserve(observeMeta);
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

    const updateTimeSignature = (ts: string) => {
        const yMeta = ydocRef.current.getMap<string>('meta');
        yMeta.set('timeSignature', ts);
        // Local state update happens via observer, but we can optimistically update if latency is an issue
        // setTimeSignature(ts); 
    };

    return { notes, addNote, clearNotes, timeSignature, updateTimeSignature };
};
