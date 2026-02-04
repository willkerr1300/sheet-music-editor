import './App.css'
import Score from './components/Score'
import { useSheetMusic } from './hooks/useSheetMusic'

function App() {
  const { notes, addNote, clearNotes } = useSheetMusic()

  // Helper to generate note buttons
  const renderNoteButton = (note: string, octave: number, duration: string, label?: string) => {
    const key = `${note}/${octave}`;
    const displayLabel = label || `${note.toUpperCase()}${octave}`;
    return (
      <button
        key={key}
        onClick={() => addNote({ keys: [key], duration })}
        className="note-btn"
      >
        {displayLabel}
      </button>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Collaborative Sheet Music Editor</h1>
        <p className="subtitle">Real-time collaboration with Grand Staff support</p>
      </header>

      <div className="main-content">
        <div className="controls-panel">

          <div className="control-group">
            <h3>Treble Clef (Right Hand)</h3>
            <div className="button-grid">
              {['c', 'd', 'e', 'f', 'g', 'a', 'b'].map(n => renderNoteButton(n, 4, 'q'))}
              {['c', 'd', 'e', 'f', 'g', 'a', 'b'].map(n => renderNoteButton(n, 5, 'q'))}
            </div>
          </div>

          <div className="control-group">
            <h3>Bass Clef (Left Hand)</h3>
            <div className="button-grid">
              {['c', 'd', 'e', 'f', 'g', 'a', 'b'].map(n => renderNoteButton(n, 2, 'q'))}
              {['c', 'd', 'e', 'f', 'g', 'a', 'b'].map(n => renderNoteButton(n, 3, 'q'))}
            </div>
          </div>

          <div className="control-group actions">
            <button onClick={() => addNote({ keys: ['b/4'], duration: 'qr' })} className="utility-btn">Add Rest</button>
            <button onClick={clearNotes} className="danger-btn">Clear Score</button>
          </div>
        </div>

        <div className="score-wrapper">
          <Score notes={notes} />
        </div>

        <p className="hint">
          Open this page in a second tab to test real-time collaboration.
        </p>
      </div>
    </div>
  )
}

export default App
