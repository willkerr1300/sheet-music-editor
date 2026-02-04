import React, { useEffect, useRef } from 'react';
import * as VF from 'vexflow';

interface NoteData {
    keys: string[];
    duration: string;
}

interface ScoreProps {
    notes: NoteData[];
}

const Score: React.FC<ScoreProps> = ({ notes }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear previous render
        containerRef.current.innerHTML = '';

        // const VF = Vex.Flow; // Removed for VexFlow 5.x compatibility

        // Create an SVG renderer and attach it to the DIV element
        const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);

        // Restore the context
        // Resize based on content if needed, but here fixed width
        renderer.resize(800, 200);
        const context = renderer.getContext();

        // Create a stave of width 700 at position 10, 40 on the canvas.
        const stave = new VF.Stave(10, 40, 700);

        // Add a clef and time signature.
        stave.addClef("treble").addTimeSignature("4/4");

        // Connect it to the rendering context and draw!
        stave.setContext(context).draw();

        if (notes.length === 0) return;

        // Create notes
        const vexNotes = notes.map(n => new VF.StaveNote({
            keys: n.keys,
            duration: n.duration
        }));

        // Create a voice in 4/4 and add notes
        // Note: VexFlow requires the voice to strictly match the time signature
        // for auto-formatting. We'll disable strict mode or pad/fill for simplicity
        // in this prototype.
        const voice = new VF.Voice({ numBeats: 4, beatValue: 4 });

        // Calculate total ticks to see if we exceed or underflow
        // For this prototype, we'll just try to add them. 
        // If we have too many, VexFlow might complain.
        // Let's assume we fill one measure or just disable strict timing if possible
        // or set mode to SOFT.
        voice.setMode(VF.Voice.Mode.SOFT);
        voice.addTickables(vexNotes);

        // Format and justify the notes to 650 pixels.
        // Ensure we don't try to justify if empty
        if (vexNotes.length > 0) {
            new VF.Formatter().joinVoices([voice]).format([voice], 650);
            voice.draw(context, stave);
        }

    }, [notes]);

    return <div ref={containerRef} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: 'white' }}></div>;
};

export default Score;
