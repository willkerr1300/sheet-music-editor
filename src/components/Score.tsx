import React, { useEffect, useRef } from 'react';
import * as VF from 'vexflow';

interface NoteData {
    keys: string[];
    duration: string;
}

interface ScoreProps {
    notes: NoteData[];
    timeSignature: string; // e.g. "4/4", "3/4"
}

const Score: React.FC<ScoreProps> = ({ notes, timeSignature }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear previous render
        containerRef.current.innerHTML = '';

        // Setup dimensions
        const containerWidth = containerRef.current.clientWidth || 800; // Dynamic width
        const rendererHeight = 600; // Initial height, can be large enough

        // Create an SVG renderer and attach it to the DIV element
        const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);
        renderer.resize(containerWidth, rendererHeight);
        const context = renderer.getContext();

        // Parse Time Signature
        const [num, den] = timeSignature.split('/').map(Number);
        const beatsPerMeasure = num;
        const beatValue = den; // e.g. 4 means quarter note gets the beat

        // Helper to get duration in "beats" (relative to the beatValue)
        const getDurationInBeats = (dur: string): number => {
            const cleanDur = dur.replace('r', ''); // handle rests
            // VexFlow duration '8' is 1/8th note. 'q' is 1/4. 'h' is 1/2. 'w' is 1.
            // If beatValue is 4 (quarter note is beat):
            // w=4, h=2, q=1, 8=0.5
            // If beatValue is 8 (eighth note is beat):
            // w=8, h=4, q=2, 8=1

            // Standard ratios to whole note:
            let ratio = 0;
            if (cleanDur === 'w') ratio = 1;
            else if (cleanDur === 'h') ratio = 0.5;
            else if (cleanDur === 'q') ratio = 0.25;
            else if (cleanDur === '8') ratio = 0.125;

            // Convert to beats: ratio * (beatValue * 1) ? 
            // Wait, simple logic:
            // 4/4: q=1. 3/4: q=1. 6/8: q=2 (since 8th is 1).
            // Formula: ratio * beatValue doesn't work directly if beatValue is denominator..
            // Logic: Whole note = 4 quarters = 8 eighths = 1.
            // Bearts = ratio * 4 * (beatValue/4) ?? No.
            // Simpler: 
            // Value of whole note in current time sig beats = beatValue. (e.g. 4/4, whole=4 beats. 6/8, whole=8 beats).
            // So beats = ratio * beatValue.
            return ratio * beatValue;
        };

        // Group notes into Measures
        const measures: NoteData[][] = [];
        let currentMeasure: NoteData[] = [];
        let currentMeasureBeats = 0;

        notes.forEach(note => {
            const noteBeats = getDurationInBeats(note.duration);

            // Check if adding this note exceeds the measure
            if (currentMeasureBeats + noteBeats > beatsPerMeasure + 0.001) { // epsilon for float
                // Start new measure
                measures.push(currentMeasure);
                currentMeasure = [];
                currentMeasureBeats = 0;
            }

            currentMeasure.push(note);
            currentMeasureBeats += noteBeats;
        });

        // Push the last partial measure if not empty
        // Or if empty but we wan't at least one measure? 
        // If notes is empty, currentMeasure is empty.
        if (currentMeasure.length > 0) {
            measures.push(currentMeasure);
        } else if (measures.length === 0) {
            // Ensure at least one empty measure is drawn
            measures.push([]);
        }

        // --- Rendering Logic ---

        let x = 10;
        let y = 40;
        // Calculate safe width for a measure. 
        // Initial stave (with clef/keys) needs more space.
        // Subsequent staves need less.

        // We need to group by "Systems" (lines).
        // Let's iterate measures and place staves.

        measures.forEach((measureNotes, i) => {
            // Determine width. First measure of system needs clef/time sig.

            let width = 250; // default width for a measure
            if (measureNotes.length > 4) width += (measureNotes.length - 4) * 30; // expand for many notes

            // Check if we need to wrap to next line
            if (x + width > containerWidth - 10) {
                x = 10;
                y += 250; // Move down for next system (Treble + Bass + spacing)
            }

            // 1. Create Staves
            // Treble
            const trebleStave = new VF.Stave(x, y, width);
            // Bass
            const bassStave = new VF.Stave(x, y + 110, width); // 110 gap

            // Add Clef/TimeSig/KeySig ONLY if it's the start of a line (or first measure)
            if (x === 10) {
                trebleStave.addClef("treble");
                bassStave.addClef("bass");

                // Add time signature only on the very first measure (standard) 
                // OR on every system? Standard is usually just start, but for editors often useful on new lines.
                // Let's do standard: First measure only, OR if time sig changes (not supported yet).
                // Actually, let's put it on every system for clarity in this simple editor, 
                // OR just the first one. Let's stick to first one for "proper" look, 
                // but usually editors replicate key/clef on new lines.
                trebleStave.addTimeSignature(timeSignature);
                bassStave.addTimeSignature(timeSignature);
            }

            trebleStave.setContext(context).draw();
            bassStave.setContext(context).draw();

            // Connectors (Start of system)
            if (x === 10) {
                const connector = new VF.StaveConnector(trebleStave, bassStave);
                connector.setType(VF.StaveConnector.type.BRACE);
                connector.setContext(context).draw();

                const line = new VF.StaveConnector(trebleStave, bassStave);
                line.setType(VF.StaveConnector.type.SINGLE_LEFT);
                line.setContext(context).draw();
            }

            // Measure End Barline (Single Right) for all measures
            const lineRight = new VF.StaveConnector(trebleStave, bassStave);
            lineRight.setType(VF.StaveConnector.type.SINGLE_RIGHT); // Draws a line at the end
            lineRight.setContext(context).draw();

            // 2. Process Notes for this Measure
            // Separate Notes into Treble and Bass
            const trebleNotesData: NoteData[] = [];
            const bassNotesData: NoteData[] = [];

            measureNotes.forEach(n => {
                const isTreble = n.keys.some(key => {
                    const octave = parseInt(key.split('/')[1]);
                    return octave >= 4;
                });
                if (isTreble) trebleNotesData.push(n);
                else bassNotesData.push(n);
            });

            // Helper to create VexFlow notes
            const createVexFlowNotes = (noteDataList: NoteData[], clef: string) => {
                return noteDataList.map(n => {
                    const note = new VF.StaveNote({
                        keys: n.keys,
                        duration: n.duration,
                        clef: clef
                    });
                    n.keys.forEach((key, index) => {
                        const [pitch] = key.split('/');
                        const accidentalMatch = pitch.match(/([#bn]+)$/);
                        if (accidentalMatch) {
                            note.addModifier(new VF.Accidental(accidentalMatch[1]), index);
                        }
                    });
                    return note;
                });
            };

            // 3. Render Voices
            // We MUST have tickables for a voice. If empty, we need a GhostNote or just don't draw voice?
            // VexFlow formatting requires voices to allow proper spacing. 

            const voices: VF.Voice[] = [];
            let trebleVoice: VF.Voice | null = null;
            let bassVoice: VF.Voice | null = null;

            if (trebleNotesData.length > 0) {
                const trebleVexNotes = createVexFlowNotes(trebleNotesData, "treble");
                trebleVoice = new VF.Voice({ numBeats: beatsPerMeasure, beatValue: beatValue });
                trebleVoice.setMode(VF.Voice.Mode.SOFT);
                trebleVoice.addTickables(trebleVexNotes);
                voices.push(trebleVoice);
            }

            if (bassNotesData.length > 0) {
                const bassVexNotes = createVexFlowNotes(bassNotesData, "bass");
                bassVoice = new VF.Voice({ numBeats: beatsPerMeasure, beatValue: beatValue });
                bassVoice.setMode(VF.Voice.Mode.SOFT);
                bassVoice.addTickables(bassVexNotes);
                voices.push(bassVoice);
            }

            // Format and Draw
            if (voices.length > 0) {
                new VF.Formatter().joinVoices(voices).format(voices, width - 20); // -20 padding

                if (trebleVoice) trebleVoice.draw(context, trebleStave);
                if (bassVoice) bassVoice.draw(context, bassStave);
            }

            x += width;
        });

        // Resize container height to fit final Y
        // We set 600 initially, but we can update the SVG style just to be sure.
        const finalHeight = y + 250;
        renderer.resize(containerWidth, finalHeight);

    }, [notes, timeSignature]);

    return <div ref={containerRef} style={{
        border: '1px solid #334155',
        padding: '20px',
        borderRadius: '12px',
        background: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflowX: 'hidden' // Prevent internal scroll, let container wrap
    }}></div>;
};

export default Score;
