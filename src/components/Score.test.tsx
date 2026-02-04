import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Score from './Score';


// Mock VexFlow to avoid canvas/SVG issues in jsdom environment
vi.mock('vexflow', async () => {
    return {

        Stave: class {
            constructor() { }
            addClef() { return this; }
            addTimeSignature() { return this; }
            setContext() { return this; }
            draw() { }
        },
        StaveNote: class {
            constructor() { }
        },
        Voice: class {
            static Mode = { SOFT: 1 };
            constructor() { }
            setMode() { }
            addTickables() { }
            draw() { }
        },
        Formatter: class {
            joinVoices() { return this; }
            format() { }
        },
        // Add renderer backends enum
        Renderer: Object.assign(class {
            constructor() { }
            resize() { }
            getContext() { return {}; }
        }, {
            Backends: { SVG: 1 }
        })
    };
});

describe('Score Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<Score notes={[]} timeSignature="4/4" />);
        expect(container).toBeInTheDocument();
    });

    it('renders with notes', () => {
        const notes = [{ keys: ['c/4'], duration: 'q' }];
        const { container } = render(<Score notes={notes} timeSignature="4/4" />);
        expect(container).toBeDefined();
    });
});
