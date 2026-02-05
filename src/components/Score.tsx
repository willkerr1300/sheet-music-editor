import React, { useEffect, useRef, useState } from 'react';
import * as VF from 'vexflow';

interface NoteData {
    keys: string[];
    duration: string;
}

interface ScoreProps {
    notes: NoteData[];
    timeSignature: string;
}

const Score: React.FC<ScoreProps> = ({ notes, timeSignature }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const prevNotesRef = useRef<NoteData[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        // --- Helper to get duration in beats ---
        const [num, den] = timeSignature.split('/').map(Number);
        const beatsPerMeasure = num;
        const beatValue = den;

        const getDurationInBeats = (dur: string): number => {
            const cleanDur = dur.replace('r', '');
            let ratio = 0;
            if (cleanDur === 'w') ratio = 1;
            else if (cleanDur === 'h') ratio = 0.5;
            else if (cleanDur === 'q') ratio = 0.25;
            else if (cleanDur === '8') ratio = 0.125;
            return ratio * beatValue;
        };

        // --- Grouping into Measures ---
        const measures: NoteData[][] = [];
        let currentMeasure: NoteData[] = [];
        let currentMeasureBeats = 0;

        notes.forEach(note => {
            const noteBeats = getDurationInBeats(note.duration);
            if (currentMeasureBeats + noteBeats > beatsPerMeasure + 0.001) {
                measures.push(currentMeasure);
                currentMeasure = [];
                currentMeasureBeats = 0;
            }
            currentMeasure.push(note);
            currentMeasureBeats += noteBeats;
        });
        if (currentMeasure.length > 0) measures.push(currentMeasure);
        if (measures.length === 0) measures.push([]);

        // --- Selective Rendering (Diffing Logic) ---
        // Instead of innerHTML = '', we manage child nodes
        const children = Array.from(containerRef.current.children);

        // Ensure container has same number of DIVs as measures
        while (containerRef.current.children.length < measures.length) {
            const div = document.createElement('div');
            div.className = 'measure-container';
            containerRef.current.appendChild(div);
        }
        while (containerRef.current.children.length > measures.length) {
            containerRef.current.lastChild?.remove();
        }

        measures.forEach((measureNotes, idx) => {
            const measureDiv = containerRef.current!.children[idx] as HTMLDivElement;

            // Basic Diffing: Check if notes in this measure changed
            // In a production app, we'd use a more robust hash.
            const notesJson = JSON.stringify(measureNotes);
            if (measureDiv.dataset.notes === notesJson && measureDiv.dataset.ts === timeSignature) {
                return; // Skip re-render for this measure
            }

            // Update measure
            measureDiv.innerHTML = '';
            measureDiv.dataset.notes = notesJson;
            measureDiv.dataset.ts = timeSignature;

            const width = 250 + (measureNotes.length > 4 ? (measureNotes.length - 4) * 30 : 0);
            const renderer = new VF.Renderer(measureDiv, VF.Renderer.Backends.SVG);
            renderer.resize(width, 150);
            const context = renderer.getContext();

            const stave = new VF.Stave(0, 0, width);
            if (idx === 0) {
                stave.addClef("treble").addTimeSignature(timeSignature);
            }
            stave.setContext(context).draw();

            if (measureNotes.length > 0) {
                const vfNotes = measureNotes.map(n => {
                    const sn = new VF.StaveNote({ keys: n.keys, duration: n.duration, clef: "treble" });
                    n.keys.forEach((key, kIdx) => {
                        const acc = key.split('/')[0].substring(1);
                        if (acc) sn.addModifier(new VF.Accidental(acc), kIdx);
                    });
                    return sn;
                });

                const voice = new VF.Voice({ numBeats: beatsPerMeasure, beatValue: beatValue });
                voice.addTickables(vfNotes);
                new VF.Formatter().joinVoices([voice]).format([voice], width - 50);
                voice.draw(context, stave);
            }
        });

        prevNotesRef.current = notes;
    }, [notes, timeSignature]);

    return (
        <div ref={containerRef} className="score-flex-container" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            background: 'white',
            padding: '20px',
            borderRadius: '12px'
        }}></div>
    );
};

export default Score;
