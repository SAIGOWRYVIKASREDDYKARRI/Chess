export class Engine {
  constructor() {
    // Determine the worker URL (we copied stockfish.js to public/)
    this.worker = new Worker('/stockfish.js');
    this.worker.onmessage = this.onMessage.bind(this);
    this.callbacks = {};
    
    // Initialize UCI mode
    this.worker.postMessage('uci');
  }

  onMessage(event) {
    const line = event.data;
    if (line.startsWith('bestmove')) {
      const match = line.match(/bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/);
      if (match && this.callbacks.bestmove) {
        this.callbacks.bestmove(match[1]);
        this.callbacks.bestmove = null; // one-time callback
      }
    }
  }

  evaluatePosition(fen, difficulty, callback) {
    // difficulty settings
    let skillLevel = 10;
    let depth = 10;
    
    switch(difficulty) {
      case 'Easy':
        skillLevel = 1;
        depth = 5;
        break;
      case 'Medium':
        skillLevel = 10;
        depth = 10;
        break;
      case 'Hard':
        skillLevel = 20;
        depth = 15;
        break;
      default:
        break;
    }

    this.worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
    this.worker.postMessage(`position fen ${fen}`);
    this.callbacks.bestmove = callback;
    this.worker.postMessage(`go depth ${depth}`);
  }

  stop() {
    this.worker.postMessage('stop');
  }

  quit() {
    this.worker.postMessage('quit');
  }
}
