import { Chess } from 'chess.js';
const c = new Chess();
try {
  c.move({ from: 'e2', to: 'e4', promotion: 'q' });
  console.log('success 1');
} catch (e) {
  console.error('error 1', e.message);
}

try {
  const c2 = new Chess();
  c2.move('e4');
  console.log('success 2');
} catch (e) {
  console.error('error 2', e.message);
}
