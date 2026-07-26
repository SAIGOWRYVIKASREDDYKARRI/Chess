import React from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessGame } from './hooks/useChessGame';
import './App.css';

const AUTH_STORAGE_KEY = 'nexus-chess-auth-v1';
const USERS_STORAGE_KEY = 'nexus-chess-users-v1';

const DEFAULT_USERS = [
  {
    email: 'admin@nebula.chess',
    password: 'admin123',
    displayName: 'Astra Admin',
    role: 'admin',
    rememberMe: true
  },
  {
    email: 'rook@nebula.chess',
    password: 'checkmate',
    displayName: 'Rook Player',
    role: 'player',
    rememberMe: true
  }
];

const ROLE_PERMISSIONS = {
  guest: {
    canPlayComputer: false,
    canAdjustDifficulty: false,
    canViewLogs: false,
    canUseFullControls: false
  },
  player: {
    canPlayComputer: true,
    canAdjustDifficulty: true,
    canViewLogs: false,
    canUseFullControls: true
  },
  admin: {
    canPlayComputer: true,
    canAdjustDifficulty: true,
    canViewLogs: true,
    canUseFullControls: true
  }
};

function readStoredUsers() {
  if (typeof window === 'undefined') {
    return DEFAULT_USERS;
  }

  const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USERS;
  } catch {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
}

function readStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function saveUsers(users) {
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function saveSession(session) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function LoginScreen({ onAuthenticate }) {
  const [mode, setMode] = React.useState('login');
  const [email, setEmail] = React.useState('rook@nebula.chess');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Enter both email and password to continue.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = onAuthenticate({
      mode,
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
      rememberMe
    });

    if (!result.ok) {
      setSuccess('');
      setError(result.message);
      return;
    }

    setError('');

    if (result.nextMode) {
      setMode(result.nextMode);
      setPassword('');
      setConfirmPassword('');
      setSuccess(result.message || 'Account created. Please sign in to continue.');
      return;
    }

    setSuccess('');
  };

  const fillDemoCredentials = () => {
    setEmail('rook@nebula.chess');
    setPassword('checkmate');
    setConfirmPassword('checkmate');
    setError('');
  };

  const handleGuestAccess = () => {
    onAuthenticate({
      mode: 'guest',
      email: 'guest@nebula.chess',
      password: '',
      confirmPassword: '',
      rememberMe: false
    });
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setError('');
    setSuccess('');
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero glass-panel">
        <div className="auth-badge">Nexus Chess</div>
        <h1>Sign in to your chess arena</h1>
        <p>
          Track games, switch engine difficulty, and jump into a premium board experience with a quick, polished login.
        </p>

        <div className="auth-stats">
          <div>
            <strong>128</strong>
            <span>rated matches logged</span>
          </div>
          <div>
            <strong>3</strong>
            <span>engine modes ready</span>
          </div>
          <div>
            <strong>99.9%</strong>
            <span>uptime for demo play</span>
          </div>
        </div>
      </section>

      <section className="auth-card glass-panel">
        <div className="auth-card-top">
          <span className="auth-chip">Secure access</span>
          <button type="button" className="ghost-link" onClick={fillDemoCredentials}>
            Use demo login
          </button>
        </div>

        <div className="auth-switch">
          <button
            type="button"
            className={`auth-switch-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => handleModeChange('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`auth-switch-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => handleModeChange('register')}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {mode === 'register' && (
            <label>
              Confirm password
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
            </label>
          )}

          <div className="auth-options">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Remember me
            </label>
            <button type="button" className="ghost-link">
              Forgot password?
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button className="btn btn-primary auth-submit" type="submit">
            {mode === 'register' ? 'Create account' : 'Enter chess room'}
          </button>
        </form>

        <div className="auth-footer">
          <span>{mode === 'register' ? 'Already have an account?' : 'New here?'}</span>
          <button
            type="button"
            className="ghost-link"
            onClick={() => handleModeChange(mode === 'register' ? 'login' : 'register')}
          >
            {mode === 'register' ? 'Back to sign in' : 'Create an account'}
          </button>
        </div>

        <button type="button" className="guest-link" onClick={handleGuestAccess}>
          Continue as guest
        </button>
      </section>
    </div>
  );
}

function App() {
  const [users, setUsers] = React.useState(() => readStoredUsers());
  const [session, setSession] = React.useState(() => readStoredSession());
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

  const currentRole = session?.role || 'guest';
  const permissions = ROLE_PERMISSIONS[currentRole] || ROLE_PERMISSIONS.guest;

  React.useEffect(() => {
    saveUsers(users);
  }, [users]);

  React.useEffect(() => {
    if (session && session.rememberMe) {
      saveSession(session);
    } else {
      clearSession();
    }
  }, [session]);

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

  const handleLogout = () => {
    setSession(null);
    setLogs([]);
    resetGame();
  };

  const handleAuthenticate = ({ mode, email, password, confirmPassword, rememberMe }) => {
    if (mode === 'guest') {
      setLogs([]);
      resetGame();
      setMode('Human vs Human');
      setSession({
        email: 'guest@nebula.chess',
        displayName: 'Guest Player',
        role: 'guest',
        rememberMe: false,
        signedInAt: new Date().toISOString()
      });
      return { ok: true };
    }

    if (mode === 'register') {
      if (password.length < 8) {
        return { ok: false, message: 'Use at least 8 characters for a new password.' };
      }

      const existingUser = users.find((user) => user.email === email);
      if (existingUser) {
        return { ok: false, message: 'An account with that email already exists.' };
      }

      const nextUsers = [
        ...users,
        {
          email,
          password,
          displayName: email.split('@')[0],
          role: 'player',
          rememberMe
        }
      ];

      setUsers(nextUsers);
      return {
        ok: true,
        nextMode: 'login',
        message: 'Account created. Please sign in to continue.'
      };
    }

    const matchedUser = users.find((user) => user.email === email && user.password === password);
    if (!matchedUser) {
      return { ok: false, message: 'Invalid email or password.' };
    }

    setLogs([]);
    resetGame();
    setMode(matchedUser.role === 'guest' ? 'Human vs Human' : 'Human vs Computer');
    setSession({
      email: matchedUser.email,
      displayName: matchedUser.displayName,
      role: matchedUser.role,
      rememberMe,
      signedInAt: new Date().toISOString()
    });
    return { ok: true };
  };

  if (!session) {
    return <LoginScreen onAuthenticate={handleAuthenticate} />;
  }

  const handleProtectedDrop = (dropArgs) => {
    if (!permissions.canUseFullControls) {
      return false;
    }

    return onDrop(dropArgs);
  };

  const handleProtectedMouseOver = (hoverArgs) => {
    if (!permissions.canUseFullControls) {
      return;
    }

    return onMouseOverSquare(hoverArgs);
  };

  const handleProtectedMouseOut = (hoverArgs) => {
    if (!permissions.canUseFullControls) {
      return;
    }

    return onMouseOutSquare(hoverArgs);
  };

  return (
    <div className="app-container">
      <header className="header dashboard-header">
        <div>
          <p className="eyebrow">{session.displayName} · {session.role}</p>
          <h1>Nexus Chess</h1>
          <p>Premium Web Chess Experience</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleLogout}>
          Sign out
        </button>
      </header>

      <main className="game-area">
        <div className="board-container glass-panel">
          <Chessboard
            options={{
              id: 'BasicBoard',
              position: fen,
              onPieceDrop: handleProtectedDrop,
              onMouseOverSquare: handleProtectedMouseOver,
              onMouseOutSquare: handleProtectedMouseOut,
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
                disabled={!permissions.canPlayComputer}
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
                disabled={!permissions.canAdjustDifficulty}
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
              <button className="btn" onClick={undo} disabled={!permissions.canUseFullControls}>Undo</button>
              <button className="btn" onClick={redo} disabled={!permissions.canUseFullControls}>Redo</button>
              <button className="btn btn-danger" onClick={handleRestartGame} disabled={!permissions.canUseFullControls}>
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
          
          {permissions.canViewLogs && (
            <div style={{marginTop: '1rem', color: 'red', fontSize: '0.8rem', maxHeight: '150px', overflowY: 'auto'}}>
              {logs.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          )}
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
