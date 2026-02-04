import './App.css'
import Score from './components/Score'
import { useSheetMusic } from './hooks/useSheetMusic'

function App() {
  const { notes, addNote, clearNotes } = useSheetMusic()

  return (
    <div className="app-container">
      <h1>Collaborative Sheet Music Editor</h1>
      <div className="card">
        <div className="controls">
          <button onClick={() => addNote({ keys: ['c/4'], duration: 'q' })}>Add C4</button>
          <button onClick={() => addNote({ keys: ['d/4'], duration: 'q' })}>Add D4</button>
          <button onClick={() => addNote({ keys: ['e/4'], duration: 'q' })}>Add E4</button>
          <button onClick={() => addNote({ keys: ['b/4'], duration: 'qr' })}>Add Rest</button>
          <button onClick={clearNotes} className="danger-btn">Clear Score</button>
        </div>

        <div className="score-wrapper">
          <Score notes={notes} />
        </div>

        <p className="hint">
          Open this URL in a second tab to test real-time collaboration.
        </p>
      </div>
    </div>
  )
}

export default App
