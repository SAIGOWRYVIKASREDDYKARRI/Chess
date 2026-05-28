import React from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessGame } from './hooks/useChessGame';
import './App.css';

function App() {
  const {
    fen,
    turn,
    gameStatus,
    mode,
    difficulty,
    setMode,
    setDifficulty,
    onDrop,
    onMouseOverSquare,
    onMouseOutSquare,
    legalMoves,
    lastMove,
    illegalSquare,
    moves,
    undo,
    redo,
    promotionPending,
    confirmPromotion,
    cancelPromotion,
    resetGame,
    isGameOver
  } = useChessGame();

  const [logs, setLogs] = React.useState([]);

  React.useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    console.log = (...args) => {
      setLogs(prev => [...prev, args.join(' ')]);
      originalLog(...args);
    };
    console.error = (...args) => {
      setLogs(prev => [...prev, 'ERROR: ' + args.join(' ')]);
      originalError(...args);
    };
    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setLogs([]);
    resetGame();
  };

  const handleRestartGame = () => {
    setLogs([]);
    resetGame();
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Nexus Chess</h1>
        <p>Premium Web Chess Experience</p>
      </header>

      <main className="game-area">
        <div className="board-container glass-panel">
          <Chessboard
            options={{
              id: 'BasicBoard',
              position: fen,
              onPieceDrop: onDrop,
              onMouseOverSquare: onMouseOverSquare,
              onMouseOutSquare: onMouseOutSquare,
              boardOrientation: 'white',
              darkSquareStyle: { backgroundColor: 'var(--board-dark)' },
              lightSquareStyle: { backgroundColor: 'var(--board-light)' },
              animationDurationInMs: 300,
              arrows: lastMove ? [{ startSquare: lastMove.from, endSquare: lastMove.to, color: '#3b82f6' }] : [],
              arrowOptions: { color: '#3b82f6', opacity: 0.9 },
              squareRenderer: ({ piece, square, children }) => {
                const isLegal = legalMoves.includes(square);
                const isLast = lastMove && (lastMove.from === square || lastMove.to === square);
                const isIllegal = illegalSquare === square;
                const classes = ['square-renderer'];
                if (isLast) classes.push('last-move');
                if (isIllegal) classes.push('shake');

                return (
                  <div className={classes.join(' ')} style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {children}
                    {isLegal && <div className="square-dot" />}
                    {isLast && <div className="last-move-overlay" />}
                  </div>
                );
              }
            }}
          />
        </div>

        <aside className="controls-container glass-panel">
          {gameStatus && (
            <div className={`game-status ${isGameOver ? 'game-over' : 'check'}`}>
              {gameStatus}
            </div>
          )}

          <div className="control-group">
            <label>Game Mode</label>
            <div className="button-group">
              <button 
                className={`btn ${mode === 'Human vs Computer' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleModeChange('Human vs Computer')}
              >
                vs Computer
              </button>
              <button 
                className={`btn ${mode === 'Human vs Human' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleModeChange('Human vs Human')}
              >
                vs Human
              </button>
            </div>
          </div>

          {mode === 'Human vs Computer' && (
            <div className="control-group">
              <label>Computer Difficulty</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          )}

          <div className="control-group">
            <label>Game Controls</label>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button className="btn" onClick={undo}>Undo</button>
              <button className="btn" onClick={redo}>Redo</button>
              <button className="btn btn-danger" onClick={handleRestartGame}>
                Restart Game
              </button>
            </div>
          </div>

          <div className="control-group">
            <label>Move History</label>
            <div style={{maxHeight: '180px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.04)', borderRadius: '8px'}}>
              {moves.length === 0 && <div style={{opacity:0.7}}>No moves yet</div>}
              {moves.map((m, i) => (
                <div key={i} style={{fontSize: '0.9rem', padding: '0.25rem 0'}}>{i + 1}. {m.san || `${m.from}${m.to}`}</div>
              ))}
            </div>
          </div>

          <div className="control-group" style={{marginTop: 'auto'}}>
            <label>Current Turn</label>
            <div style={{
              padding: '1rem',
              textAlign: 'center',
              fontWeight: 'bold',
              borderRadius: '8px',
              backgroundColor: turn === 'w' ? '#f8fafc' : '#1e293b',
              color: turn === 'w' ? '#0f172a' : '#f8fafc',
              border: '1px solid var(--glass-border)',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              {turn === 'w' ? 'White to Move' : 'Black to Move'}
            </div>
          </div>
          
          <div style={{marginTop: '1rem', color: 'red', fontSize: '0.8rem', maxHeight: '150px', overflowY: 'auto'}}>
            {logs.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </aside>
      </main>
      {promotionPending && (
        <div className="promotion-modal">
          <div className="promotion-box">
            <div style={{fontWeight: 700, paddingRight: '0.5rem', display: 'flex', alignItems: 'center'}}>Promote to:</div>
            <button className="promotion-btn" title="Queen" onClick={() => confirmPromotion('q')}>♕</button>
            <button className="promotion-btn" title="Rook" onClick={() => confirmPromotion('r')}>♖</button>
            <button className="promotion-btn" title="Bishop" onClick={() => confirmPromotion('b')}>♗</button>
            <button className="promotion-btn" title="Knight" onClick={() => confirmPromotion('n')}>♘</button>
            <button className="promotion-btn" onClick={cancelPromotion}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
