const canvas = document.getElementById("checkersCanvas");
const ctx = canvas.getContext("2d");
const restartButton = document.getElementById("restartButton");

const TILE_SIZE = canvas.width / 8;
const COLORS = {
  light: "#f0d9b5",
  dark: "#b58863",
  pieceW: "#ffffff",
  pieceB: "#000000",
  pieceQueen: "#ffd700", 
  highlight: "rgba(0, 255, 0, 0.5)",
};

let game = new Checkers();
drawBoard();
let selectedPiece = null;

function drawPiece(row, col, piece) {
  const x = col * TILE_SIZE + TILE_SIZE / 2;
  const y = row * TILE_SIZE + TILE_SIZE / 2;
  ctx.beginPath();
  ctx.arc(x, y, TILE_SIZE / 3, 0, Math.PI * 2);
  ctx.fillStyle = piece.includes("K") ? COLORS.pieceQueen : (piece[0] === "W" ? COLORS.pieceW : COLORS.pieceB);
    ctx.fill();
    ctx.strokeStyle = piece.includes("K") ? COLORS.pieceQueen : "#000";
    ctx.lineWidth = piece.includes("K") ? 4 : 2;
    ctx.stroke();
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isDark = (row + col) % 2 === 1;
      ctx.fillStyle = isDark ? COLORS.dark : COLORS.light;
      ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      const piece = game.board[row][col];
      if (piece) drawPiece(row, col, piece);
    }
  }
}

  
function highlightMoves(moves) {
    moves.forEach(([_, to]) => {
        const [row, col] = to;
        ctx.fillStyle = COLORS.highlight; 
        ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE); 
        ctx.strokeStyle = "green";
        ctx.lineWidth = 3;
        ctx.strokeRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE); 
    });

}

restartButton.addEventListener("click", () => {
    game.resetGame();
    drawBoard();
    updateUI();
});


function updateUI() {
    document.getElementById("currentPlayer").textContent = `Turno: ${
        game.currentPlayer === "W" ? "Branco" : "Preto"
    }`;
    document.getElementById("whitePieces").textContent = `Peças brancas: ${game
        .board.flat()
        .filter(cell => cell?.[0] === "W").length}`;
    document.getElementById("blackPieces").textContent = `Peças pretas: ${game
        .board.flat()
        .filter(cell => cell?.[0] === "B").length}`;
}
  
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    const row = Math.floor(y / TILE_SIZE);
    const col = Math.floor(x / TILE_SIZE);

    console.log(`Clique detectado em: row=${row}, col=${col}`);

    if (selectedPiece) {
        const moves = game.getValidMoves(selectedPiece);
        const validMove = moves.find(([from, to]) =>
            from[0] === selectedPiece[0] &&
            from[1] === selectedPiece[1] &&
            to[0] === row &&
            to[1] === col
        );

        if (validMove) {
            game.movePiece(validMove[0], validMove[1]);
            drawBoard();

            selectedPiece = null;
            game.switchTurn(); 
            
            if (game.currentPlayer === "B") {
                setTimeout(playAITurn, 500);
            }
        } else {
            console.log("Movimento inválido!");
            selectedPiece = null;
        }
    } else {
        const piece = game.board[row][col];
        if (piece && piece[0] === game.currentPlayer) {
            selectedPiece = [row, col];
            const moves = game.getValidMoves(selectedPiece);
            if (moves.length > 0) {
                highlightMoves(moves);
            } else {
                console.log("Nenhum movimento válido para esta peça.");
                selectedPiece = null;
            }
        } else {
            console.log("Nenhuma peça válida selecionada.");
        }
    }
});

    if (game.currentPlayer === "B") {
      setTimeout(playAITurn, 500); 
    }
  
  
    function playAITurn() {
        const captureMoves = game.generateMoves("B").filter(([from, to]) =>
            Math.abs(from[0] - to[0]) === 2
        );
    
        const moves = captureMoves.length > 0 ? captureMoves : game.generateMoves("B");
    
        if (moves.length === 0) {
            document.getElementById("message").textContent = "Vitória das peças brancas!";
            return;
        }
    
        const [from, to] = moves[Math.floor(Math.random() * moves.length)];
        game.movePiece(from, to);
    
        drawBoard();
        game.switchTurn();
    }
    
      