import * as Y from 'yjs';

// Simulation of the CRDT Document handler
export class MusicDocument {
    doc: Y.Doc;
    notes: Y.Array<any>;

    constructor() {
        this.doc = new Y.Doc();
        this.notes = this.doc.getArray('notes');
    }

    addNote(noteData: any) {
        this.doc.transact(() => {
            this.notes.push([noteData]);
        });
    }

    // Simulate concurrent updates
    static simulateConcurrency(numUsers: number) {
        const docs = Array.from({ length: numUsers }, () => new MusicDocument());
        
        // Simulate users adding notes simultaneously
        docs.forEach((d, i) => {
            d.addNote({ pitch: 'C4', duration: 'q', user: i });
        });

        // Sync all docs (mock sync)
        const updates = docs.map(d => Y.encodeStateAsUpdate(d.doc));
        
        // Apply all updates to a master doc
        const master = new MusicDocument();
        updates.forEach(u => Y.applyUpdate(master.doc, u));

        return master.notes.length === numUsers;
    }
}
