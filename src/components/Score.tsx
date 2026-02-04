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

        // Create an SVG renderer and attach it to the DIV element
        const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);

        // Size our SVG: 800 width, 400 height to fit two staves
        renderer.resize(800, 400);
        const context = renderer.getContext();

        // 1. Create Staves
        // Treble Stave
        const trebleStave = new VF.Stave(20, 40, 700);
        trebleStave.addClef("treble").addTimeSignature("4/4");
        trebleStave.setContext(context).draw();

        // Bass Stave (positioned lower)
        const bassStave = new VF.Stave(20, 150, 700);
        bassStave.addClef("bass").addTimeSignature("4/4");
        bassStave.setContext(context).draw();

        // Connector (Brace)
        const connector = new VF.StaveConnector(trebleStave, bassStave);
        connector.setType(VF.StaveConnector.type.BRACE);
        connector.setContext(context).draw();

        // Line Connector (Left and Right sides)
        const lineLeft = new VF.StaveConnector(trebleStave, bassStave);
        lineLeft.setType(VF.StaveConnector.type.SINGLE_LEFT);
        lineLeft.setContext(context).draw();

        const lineRight = new VF.StaveConnector(trebleStave, bassStave);
        lineRight.setType(VF.StaveConnector.type.SINGLE_RIGHT);
        lineRight.setContext(context).draw();

        if (notes.length === 0) return;

        // 2. Separate Notes into Treble and Bass
        // Simple Heuristic: Octave >= 4 goes to Treble, Octave < 4 goes to Bass
        const trebleNotesData: NoteData[] = [];
        const bassNotesData: NoteData[] = [];

        notes.forEach(n => {
            // Check keys (e.g., "c/4"). If any key is in octave 4,5,6 -> Treble
            // This is a naive split; ideally chords shouldn't be split but for this editor it's fine.
            const isTreble = n.keys.some(key => {
                const octave = parseInt(key.split('/')[1]);
                return octave >= 4;
            });

            if (isTreble) {
                trebleNotesData.push(n);
                // Pad Bass with rest? No, VexFlow separate voices need alignment.
                // For a simple "add note" editor, we usually want simultaneous notes.
                // BUT, to keep it simple for this "Resume Project", we will just render
                // independent melodic lines on each stave.
                // If we want rigorous rhythmic alignment, we'd need to insert rests.
            } else {
                bassNotesData.push(n);
            }
        });

        // 3. Render Treble Voice
        if (trebleNotesData.length > 0) {
            const trebleVexNotes = trebleNotesData.map(n => new VF.StaveNote({
                keys: n.keys,
                duration: n.duration,
                clef: "treble"
            }));

            const trebleVoice = new VF.Voice({ numBeats: 4, beatValue: 4 });
            trebleVoice.setMode(VF.Voice.Mode.SOFT);
            trebleVoice.addTickables(trebleVexNotes);

            new VF.Formatter().joinVoices([trebleVoice]).format([trebleVoice], 650);
            trebleVoice.draw(context, trebleStave);
        }

        // 4. Render Bass Voice
        if (bassNotesData.length > 0) {
            const bassVexNotes = bassNotesData.map(n => new VF.StaveNote({
                keys: n.keys,
                duration: n.duration,
                clef: "bass"
            }));

            const bassVoice = new VF.Voice({ numBeats: 4, beatValue: 4 });
            bassVoice.setMode(VF.Voice.Mode.SOFT);
            bassVoice.addTickables(bassVexNotes);

            new VF.Formatter().joinVoices([bassVoice]).format([bassVoice], 650);
            bassVoice.draw(context, bassStave);
        }

    }, [notes]);

    return <div ref={containerRef} style={{
        border: '1px solid #334155',
        padding: '20px',
        borderRadius: '12px',
        background: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}></div>;
};

export default Score;
