// Mock VexFlow Renderer with Diffing
export class SheetRenderer {
    fps: number = 0;

    // Naive render: clear and redraw everything
    renderNaive(items: number) {
        // Simulate heavy work
        let work = 0;
        for (let i = 0; i < items * 1000; i++) { work += i; }
    }

    // Diff render: only redraw changes
    renderDiff(totalItems: number, changedItems: number) {
        // Simulate lighter work
        let work = 0;
        for (let i = 0; i < changedItems * 1000; i++) { work += i; }
        // Overhead of diffing
        for (let i = 0; i < totalItems * 10; i++) { work += i; }
    }

    measureFPS(mode: 'naive' | 'diff', items: number, changes: number): number {
        const start = performance.now();
        const frames = 100;
        for (let i = 0; i < frames; i++) {
            if (mode === 'naive') this.renderNaive(items);
            else this.renderDiff(items, changes);
        }
        const end = performance.now();
        const durationSec = (end - start) / 1000;
        return Math.round(frames / durationSec);
    }
}
