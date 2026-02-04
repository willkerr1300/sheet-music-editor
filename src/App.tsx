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

  // Pass roomName to hook
  const { notes, addNote, clearNotes, timeSignature, updateTimeSignature } = useSheetMusic(roomName);

  const handleJoinRoom = () => {
    if (tempRoom.trim()) {
      setRoomName(tempRoom.trim());
    }
  };

  const handleAddNote = () => {
    // Construct key: "c#/4" or "db/4" or "c/4"
    // If rest, key doesn't matter as much but VexFlow often likes "b/4" for default rest pos
    let key = `${pitch}${accidental}/${octave}`;
    if (isRest) {
      // Standard rest position often middle of staff like b/4
      key = `b/4`;
    }

    const dur = isRest ? `${duration}r` : duration;
    addNote({ keys: [key], duration: dur });
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
            <button onClick={handleAddNote} className="primary-btn">Insert Note / Rest</button>
            <button onClick={clearNotes} className="danger-btn">Clear Score</button>
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
