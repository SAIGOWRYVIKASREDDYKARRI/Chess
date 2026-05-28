import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { Engine } from '../engine/engine';

export function useChessGame() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [mode, setMode] = useState('Human vs Computer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [gameStatus, setGameStatus] = useState('');
  const [turn, setTurn] = useState('w');
  const [legalMoves, setLegalMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [illegalSquare, setIllegalSquare] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pastFens, setPastFens] = useState([]);
  const [futureFens, setFutureFens] = useState([]);
  const [moves, setMoves] = useState([]);
  const [futureMoves, setFutureMoves] = useState([]);
  const [promotionPending, setPromotionPending] = useState(null);
  
  const engineRef = useRef(null);
  
  // Initialize Engine
  useEffect(() => {
    engineRef.current = new Engine();
    return () => {
      if (engineRef.current) {
        engineRef.current.quit();
      }
    };
  }, []);

  // Check Game Status
  const updateStatus = useCallback((cg) => {
    let statusText = '';
    if (cg.isCheckmate()) {
      statusText = `Checkmate! ${cg.turn() === 'w' ? 'Black' : 'White'} wins!`;
    } else if (cg.isDraw()) {
      statusText = 'Draw!';
    } else if (cg.isCheck()) {
      statusText = 'Check!';
    }
    setGameStatus(statusText);
    setFen(cg.fen());
    setTurn(cg.turn());
  }, []);

  // Computer Move Logic
  const makeComputerMove = useCallback(() => {
    if (game.isGameOver() || game.turn() === 'w' || mode === 'Human vs Human') return;
    
    // We pass the current fen to stockfish
    engineRef.current.evaluatePosition(game.fen(), difficulty, (bestMove) => {
      const cg = new Chess(game.fen());
      try {
        setIsProcessing(true);
        cg.move({
          from: bestMove.substring(0, 2),
          to: bestMove.substring(2, 4),
          promotion: bestMove.length > 4 ? bestMove[4] : 'q',
        });
        setGame(cg);
        // record last move for UI highlights
        setLastMove({ from: bestMove.substring(0, 2), to: bestMove.substring(2, 4) });
        updateStatus(cg);
        setIsProcessing(false);
      } catch (e) {
        setIsProcessing(false);
        console.error("Invalid move from engine:", bestMove, e);
      }
    });
  }, [game, difficulty, mode, updateStatus]);

  // Trigger computer move if it's black's turn
  useEffect(() => {
    if (mode === 'Human vs Computer' && turn === 'b' && !game.isGameOver()) {
      // Small timeout to allow UI update before computer starts thinking
      const timer = setTimeout(() => {
        makeComputerMove();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [turn, mode, game, makeComputerMove]);

  const onDrop = ({ sourceSquare, targetSquare, piece }) => {
    if (!sourceSquare || !targetSquare) {
      return false;
    }

    if (isProcessing) {
      // prevent user interaction while a move is processing
      return false;
    }

    console.log(`onDrop triggered: ${sourceSquare} to ${targetSquare}. Turn: ${turn}`);
    if (mode === 'Human vs Computer' && turn === 'b') {
      console.log('Prevented move: It is computer\'s turn');
      return false; // Prevent playing for computer
    }
    
    const cg = new Chess(game.fen());
    try {
      setIsProcessing(true);
      const moveData = {
        from: sourceSquare,
        to: targetSquare,
      };

      // detect promotion for pawns and pause for chooser
      const pieceType = (piece && piece.pieceType) ? piece.pieceType : null;
      if (pieceType && pieceType.toLowerCase() === 'p' && (targetSquare[1] === '1' || targetSquare[1] === '8')) {
        // ask UI to present promotion options
        setPromotionPending({ from: sourceSquare, to: targetSquare, piece: pieceType });
        return false;
      }

      const move = cg.move(moveData);
      if (!move) {
        // show a short shake on the source square
        setIllegalSquare(sourceSquare);
        setTimeout(() => setIllegalSquare(null), 600);
        setIsProcessing(false);
        return false;
      }

      console.log('Move successful:', move);

      // update history stacks
      setPastFens(prev => [...prev, game.fen()]);
      setFutureFens([]);
      setFutureMoves([]);
      setMoves(prev => [...prev, move]);

      setGame(cg);
      // update last move for UI
      setLastMove({ from: move.from, to: move.to });
      // clear any legal move hints
      setLegalMoves([]);
      updateStatus(cg);
      setIsProcessing(false);
      return true;
    } catch (e) {
      setIsProcessing(false);
      console.error('Invalid move:', e);
      return false;
    }
  };

  const applyMove = (moveData) => {
    const cg = new Chess(game.fen());
    try {
      const move = cg.move(moveData);
      if (!move) return false;
      setPastFens(prev => [...prev, game.fen()]);
      setFutureFens([]);
      setFutureMoves([]);
      setMoves(prev => [...prev, move]);
      setGame(cg);
      setLastMove({ from: move.from, to: move.to });
      setLegalMoves([]);
      updateStatus(cg);
      return true;
    } catch (e) {
      console.error('applyMove failed', e);
      return false;
    }
  };

  const confirmPromotion = (promotion) => {
    if (!promotionPending) return false;
    const { from, to } = promotionPending;
    const ok = applyMove({ from, to, promotion });
    setPromotionPending(null);
    return ok;
  };

  const cancelPromotion = () => {
    setPromotionPending(null);
  };

  const undo = () => {
    if (pastFens.length === 0) return false;
    const lastFen = pastFens[pastFens.length - 1];
    // move current fen to future
    setFutureFens(prev => [...prev, game.fen()]);
    setPastFens(prev => prev.slice(0, -1));
    // move last move to futureMoves
    setFutureMoves(prev => [...prev, moves[moves.length - 1]]);
    setMoves(prev => prev.slice(0, -1));
    const cg = new Chess(lastFen);
    setGame(cg);
    updateStatus(cg);
    return true;
  };

  const redo = () => {
    if (futureFens.length === 0) return false;
    const nextFen = futureFens[futureFens.length - 1];
    setPastFens(prev => [...prev, game.fen()]);
    setFutureFens(prev => prev.slice(0, -1));
    // take last futureMove
    const nextMove = futureMoves[futureMoves.length - 1];
    setFutureMoves(prev => prev.slice(0, -1));
    setMoves(prev => [...prev, nextMove]);
    const cg = new Chess(nextFen);
    setGame(cg);
    updateStatus(cg);
    return true;
  };

  const onMouseOverSquare = ({ piece, square }) => {
    if (!piece || !square) return;
    try {
      const cg = new Chess(game.fen());
      const moves = cg.moves({ square, verbose: true }).map(m => m.to);
      setLegalMoves(moves);
    } catch (e) {
      setLegalMoves([]);
    }
  };

  const onMouseOutSquare = ({ piece, square }) => {
    setLegalMoves([]);
  };

  const resetGame = () => {
    const cg = new Chess();
    setGame(cg);
    updateStatus(cg);
  };

  return {
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
    isGameOver: game.isGameOver(),
    isProcessing
  };
}
