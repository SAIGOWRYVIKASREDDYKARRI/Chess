import { Chess } from 'chess.js';

// Simple feature smoke tests for promotion and undo/redo using chess.js

function testPromotion() {
  const c = new Chess();
  // set up a white pawn on 7th rank
  c.clear();
  c.put({ type: 'p', color: 'w' }, 'e7');
  c.put({ type: 'k', color: 'w' }, 'h1');
  c.put({ type: 'k', color: 'b' }, 'a8');

  // move pawn from e7 to e8 and promote to queen
  const move = c.move({ from: 'e7', to: 'e8', promotion: 'q' });
  if (!move || move.promotion !== 'q') {
    console.error('Promotion test failed:', move);
    process.exitCode = 1;
  } else {
    console.log('Promotion test passed:', move.san || `${move.from}${move.to}`);
  }
}

function testUndoRedo() {
  const c = new Chess();
  c.move({ from: 'e2', to: 'e4' });
  c.move({ from: 'e7', to: 'e5' });
  const fenAfter = c.fen();
  // undo last
  c.undo();
  if (c.fen() === fenAfter) {
    console.error('Undo failed');
    process.exitCode = 1;
    return;
  }
  // redo by re-applying move
  c.move({ from: 'e7', to: 'e5' });
  if (c.fen() !== fenAfter) {
    console.error('Redo simulation failed');
    process.exitCode = 1;
  } else {
    console.log('Undo/Redo test passed');
  }
}

console.log('Running feature smoke tests...');
try {
  testPromotion();
  testUndoRedo();
  console.log('All tests finished.');
} catch (e) {
  console.error('Tests threw:', e);
  process.exitCode = 1;
}
