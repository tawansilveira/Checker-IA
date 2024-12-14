class Minimax {
  static evaluateBoard(board) {
      let score = 0;
      board.flat().forEach(cell => {
          if (cell === "W") score -= 10; 
          if (cell === "WK") score -= 30; 
          if (cell === "B") score += 10; 
          if (cell === "BK") score += 30; 
      });
      return score;
  }

  static minimax(game, depth, isMaximizing, alpha, beta) {
      const moves = game.generateMoves(isMaximizing ? "W" : "B");
      if (depth === 1000 || moves.length === 0) {
          return Minimax.evaluateBoard(game.board);
      }

      const captureMoves = moves.filter(([from, to]) => Math.abs(from[0] - to[0]) === 2);
      const prioritizedMoves = captureMoves.length > 0 ? captureMoves : moves;

      if (isMaximizing) {
          let maxEval = -Infinity;
          for (const [from, to] of prioritizedMoves) {
              const backup = JSON.parse(JSON.stringify(game.board));
              game.movePiece(from, to);
              const evaluation = Minimax.minimax(game, depth - 1, false, alpha, beta);
              game.board = backup;

              maxEval = Math.max(maxEval, evaluation);
              alpha = Math.max(alpha, evaluation);
              if (beta <= alpha) break; 
          }
          return maxEval;
      } else {
          let minEval = Infinity;
          for (const [from, to] of prioritizedMoves) {
              const backup = JSON.parse(JSON.stringify(game.board));
              game.movePiece(from, to);
              const evaluation = Minimax.minimax(game, depth - 1, true, alpha, beta);
              game.board = backup;

              minEval = Math.min(minEval, evaluation);
              beta = Math.min(beta, evaluation);
              if (beta <= alpha) break;
          }
          return minEval;
      }
  }

  evaluateBoard(game) {
    return game.whiteCount - game.blackCount; 
}
};



