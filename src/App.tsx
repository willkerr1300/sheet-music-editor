import { useState } from 'react'
import './App.css'
import Score from './components/Score'
import { useSheetMusic } from './hooks/useSheetMusic'

function App() {
  const [roomName, setRoomName] = useState('sheet-music-demo');
  const [tempRoom, setTempRoom] = useState(roomName);

  // Composer State
  const [pitch, setPitch] = useState('c');
  const [accidental, setAccidental] = useState(''); // '' (natural), '#', 'b'
  const [octave, setOctave] = useState('4');
  const [duration, setDuration] = useState('q');
  const [isRest, setIsRest] = useState(false);

  // Staging for Chord
  const [pendingKeys, setPendingKeys] = useState<string[]>([]);

  // Pass roomName to hook
  const { notes, addNote, clearNotes, timeSignature, updateTimeSignature } = useSheetMusic(roomName);

  const handleJoinRoom = () => {
    if (tempRoom.trim()) {
      setRoomName(tempRoom.trim());
    }
  };

  const getCurrentKey = () => {
    let key = `${pitch}${accidental}/${octave}`;
    if (isRest) {
      key = `b/4`;
    }
    return key;
  };

  const handleStageNote = () => {
    if (isRest) return; // Don't stage rests into chords for now (simplification)
    const key = getCurrentKey();
    if (!pendingKeys.includes(key)) {
      setPendingKeys([...pendingKeys, key]);
    }
  };

  const handleAddNote = () => {
    // If we have pending keys, those plus current selection? 
    // Plan: if pendingKeys > 0, insert ONLY pendingKeys? 
    // Or insert pendingKeys AND current? 
    // Let's implement: "Stage" button adds to list. "Insert" button commits list (if > 0) OR commits single note (if list==0).

    let keysToInsert: string[] = [];
    const dur = isRest ? `${duration}r` : duration;

    if (pendingKeys.length > 0) {
      keysToInsert = [...pendingKeys];
      // If user also wants to include the currently "selected" note, they should have staged it.
      // This is cleaner UX: "Builder" mode vs "Direct" mode.
    } else {
      // Direct mode: single note/rest
      keysToInsert = [getCurrentKey()];
    }

    addNote({ keys: keysToInsert, duration: dur });
    setPendingKeys([]); // Clear staging
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Collaborative Sheet Music Editor</h1>


        <div className="room-controls">
          <input
            type="text"
            value={tempRoom}
            onChange={(e) => setTempRoom(e.target.value)}
            placeholder="Enter Room Name..."
            className="room-input"
          />
          <button onClick={handleJoinRoom} className="room-btn">
            {roomName === tempRoom ? 'Current Room' : 'Switch Room'}
          </button>
        </div>
        <p className="room-status">Connected to: <strong>{roomName}</strong></p>
      </header>

      <div className="main-content">
        <div className="composer-panel">
          <div className="composer-group">
            <label>Pitch</label>
            <div className="toggle-group">
              {['c', 'd', 'e', 'f', 'g', 'a', 'b'].map(p => (
                <button
                  key={p}
                  className={pitch === p ? 'active' : ''}
                  onClick={() => setPitch(p)}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="composer-group">
            <label>Accidental</label>
            <div className="toggle-group">
              <button className={accidental === 'b' ? 'active' : ''} onClick={() => setAccidental('b')}>♭ Flat</button>
              <button className={accidental === '' ? 'active' : ''} onClick={() => setAccidental('')}>♮ Natural</button>
              <button className={accidental === '#' ? 'active' : ''} onClick={() => setAccidental('#')}>♯ Sharp</button>
            </div>
          </div>

          <div className="composer-group">
            <label>Octave</label>
            <div className="toggle-group">
              {[2, 3, 4, 5].map(o => (
                <button
                  key={o}
                  className={octave === o.toString() ? 'active' : ''}
                  onClick={() => setOctave(o.toString())}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="composer-group">
            <label>Duration</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="w">Whole</option>
              <option value="h">Half</option>
              <option value="q">Quarter</option>
              <option value="8">Eighth</option>
            </select>
          </div>

          <div className="composer-group">
            <label>Type</label>
            <button
              className={isRest ? 'active utility-btn' : 'utility-btn'}
              onClick={() => setIsRest(!isRest)}
            >
              {isRest ? 'Rest (Selected)' : 'Note'}
            </button>
          </div>

          <div className="composer-group">
            <label>Time Sig</label>
            <select value={timeSignature} onChange={(e) => updateTimeSignature(e.target.value)}>
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="2/4">2/4</option>
              <option value="6/8">6/8</option>
            </select>
          </div>

          <div className="composer-actions">
            <div className="chord-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <button
                onClick={handleStageNote}
                className="utility-btn"
                disabled={isRest}
                style={{ flex: 1 }}
              >
                Add to Chord
              </button>
              <div className="pending-notes" style={{ fontSize: '0.9rem', color: '#666' }}>
                {pendingKeys.length > 0 ? (
                  <span>Staged: <strong>{pendingKeys.join(', ')}</strong></span>
                ) : (
                  <span>(Optional: Add multiple notes)</span>
                )}
              </div>
            </div>

            <button onClick={handleAddNote} className="primary-btn">
              {pendingKeys.length > 0 ? `Insert Chord (${pendingKeys.length})` : 'Insert Note / Rest'}
            </button>
            <button onClick={() => { clearNotes(); setPendingKeys([]); }} className="danger-btn">Clear Score</button>
          </div>
        </div>

        <div className="score-wrapper">
          <Score notes={notes} timeSignature={timeSignature} />
        </div>

        <p className="hint">
          Open this page in a second tab to test real-time collaboration.
        </p>
      </div>
    </div>
  )
}

export default App
