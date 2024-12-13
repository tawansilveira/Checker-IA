class Checkers {
    constructor() {
        this.board = this.initBoard();
        this.currentPlayer = "W"; // "W" para branco, "B" para preto
        this.moveHistory = []; // Histórico de jogadas
        this.whiteCount = 12; // Inicialmente 12 peças brancas
        this.blackCount = 12; // Inicialmente 12 peças pretas
        this.updatePieceCounts();
    }

    initBoard() {
        const board = Array(8)
            .fill(null)
            .map(() => Array(8).fill(null));
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 8; j++) {
                if ((i + j) % 2 === 1) board[i][j] = "B"; // Peças pretas
            }
        }
        for (let i = 5; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if ((i + j) % 2 === 1) board[i][j] = "W"; // Peças brancas
            }
        }
        return board;
    }

    resetGame() {
        this.board = this.initBoard();
        this.currentPlayer = "W";
        this.moveHistory = [];
        this.updatePieceCounts();
    }


    updatePieceCounts() {
        this.whiteCount = this.board.flat().filter(cell => cell && cell[0] === "W").length;
        this.blackCount = this.board.flat().filter(cell => cell && cell[0] === "B").length;

        document.getElementById("whiteCount").textContent = `⚪ Brancas: ${this.whiteCount}`;
        document.getElementById("blackCount").textContent = `⚫ Pretas: ${this.blackCount}`;
    }


    isInBounds(x, y) {
        return x >= 0 && x < 8 && y >= 0 && y < 8;
    }

    getValidMoves([x, y]) {
        const piece = this.board[x][y];
        if (!piece || piece[0] !== this.currentPlayer) return [];
        return piece === "WK" || piece === "BK"
            ? this.getValidMovesForQueen([x, y])
            : this.getNormalMoves([x, y]).concat(this.getCaptureMoves([x, y]));
    }

    getNormalMoves([x, y]) {
        const piece = this.board[x][y];
        const directions = piece === "W" ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
        const moves = [];
        directions.forEach(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            if (this.isInBounds(nx, ny) && !this.board[nx][ny]) {
                moves.push([[x, y], [nx, ny]]);
            }
        });
        return moves;
    }

    getCaptureMoves([x, y]) {
        const piece = this.board[x][y];
        const directions =
            piece === "W" || piece === "WK" ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
        const captureMoves = new Set();
    
        directions.forEach(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            const cx = x + 2 * dx;
            const cy = y + 2 * dy;
            if (
                this.isInBounds(cx, cy) &&
                !this.board[cx][cy] &&
                this.board[nx][ny] &&
                this.board[nx][ny][0] !== piece[0]
            ) {
                const move = JSON.stringify([[x, y], [cx, cy]]);
                captureMoves.add(move);
            }
        });
    
        return [...captureMoves].map(move => JSON.parse(move));
    }
    getValidMovesForQueen([x, y]) {
        const piece = this.board[x][y];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // Direções diagonais
        const moves = [];
    
        directions.forEach(([dx, dy]) => {
            let nx = x + dx;
            let ny = y + dy;
            let captured = false;
            let capturedPosition = null;
    
            // Verificar movimentos da dama enquanto há casas livres ou peças adversárias
            while (this.isInBounds(nx, ny)) {
                if (!this.board[nx][ny]) {
                    // Se encontrar uma casa livre, adicionar movimento
                    if (captured) {
                        moves.push([[x, y], [nx, ny], capturedPosition]); // Movimento com captura
                    } else {
                        moves.push([[x, y], [nx, ny]]); // Movimento sem captura
                    }
                } else if (!captured && this.board[nx][ny][0] !== piece[0]) {
                    // Detectar uma peça adversária para captura
                    captured = true;
                    capturedPosition = [nx, ny]; // Registra a posição da peça adversária
                } else {
                    break; // Se encontrar uma peça da mesma cor ou não for possível capturar, interrompe a busca
                }
    
                // Continuar verificando a próxima casa na direção
                nx += dx;
                ny += dy;
            }
        });
    
        console.log("Valid queen moves:", moves); // Debug
        return moves;
    }
    
    movePiece(from, to, captured = null) {
        const [fromRow, fromCol] = from;
        const [toRow, toCol] = to;
    
        const piece = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null; // Remove a peça da posição antiga
        this.board[toRow][toCol] = piece; // Move a peça para a nova posição
    
        // Se a peça for uma dama, verificar captura (em qualquer direção)
        if (piece === "WK" || piece === "BK") {
            // Se houve captura, remover a peça capturada
            if (captured) {
                const [capturedRow, capturedCol] = captured;
                this.board[capturedRow][capturedCol] = null; // Remove a peça capturada
                // Atualizar contagem de peças
                this.updatePieceCounts();
            }
        } else if (Math.abs(fromRow - toRow) === 2) {
            // Para peças normais (não dama), a captura é feita a 2 casas de distância
            const capturedRow = (fromRow + toRow) / 2;
            const capturedCol = (fromCol + toCol) / 2;
            this.board[capturedRow][capturedCol] = null; // Remove a peça capturada
            // Atualizar contagem de peças
            this.updatePieceCounts();
        }
    
        // Verificar promoção para dama
        if (piece === "W" && toRow === 0) this.board[toRow][toCol] = "WK";
        if (piece === "B" && toRow === 7) this.board[toRow][toCol] = "BK";
    
        // Salvar movimento no histórico
        this.moveHistory.push({ from, to, captured, piece });
    }
    
    
    
    
    
    isCaptureMandatory(player) {
        return this.generateMoves(player).some(([from, to]) => 
            Math.abs(from[0] - to[0]) === 2
        );
    }
    

    generateMoves(player) {
        const moves = new Set(); // Use um Set para garantir que não existam duplicatas
        this.board.forEach((row, x) => {
            row.forEach((cell, y) => {
                if (cell?.[0] === player) {
                    const pieceMoves = this.getValidMoves([x, y]);
                    pieceMoves.forEach(move => moves.add(JSON.stringify(move)));
                }
            });
        });
        return [...moves].map(move => JSON.parse(move)); // Converta de volta para array de movimentos
    }
    switchTurn() {
        this.currentPlayer = this.currentPlayer === "W" ? "B" : "W";
    }
    
    isGameOver() {
        return (
            this.generateMoves("W").length === 0 || this.generateMoves("B").length === 0
        );
    }

    recordMove(from, to, piece) {
        this.moveHistory.push({ from, to, piece });
    }

    undoMove() {
        const lastMove = this.moveHistory.pop();
        if (!lastMove) return;
        const { from, to, piece } = lastMove;
        this.board[to[0]][to[1]] = null;
        this.board[from[0]][from[1]] = piece;
    }
}
