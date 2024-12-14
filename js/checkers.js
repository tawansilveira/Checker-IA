class Checkers {
    constructor() {
        this.board = this.initBoard();
        this.currentPlayer = "W"; 
        this.moveHistory = []; 
        this.whiteCount = 12; 
        this.blackCount = 12; 
        this.updatePieceCounts();
    }

    initBoard() {
        const board = Array(8)
            .fill(null)
            .map(() => Array(8).fill(null));
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 8; j++) {
                if ((i + j) % 2 === 1) board[i][j] = "B"; 
            }
        }
        for (let i = 5; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if ((i + j) % 2 === 1) board[i][j] = "W"; 
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
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        const moves = [];
    
        directions.forEach(([dx, dy]) => {
            let nx = x + dx;
            let ny = y + dy;
            let captured = false;
            let capturedPosition = null;
    
            while (this.isInBounds(nx, ny)) {
                if (!this.board[nx][ny]) {
                    if (captured) {
                        moves.push([[x, y], [nx, ny], capturedPosition]); 
                    } else {
                        moves.push([[x, y], [nx, ny]]); 
                    }
                } else if (!captured && this.board[nx][ny][0] !== piece[0]) {
                    captured = true;
                    capturedPosition = [nx, ny]; 
                } else {
                    break; 
                }
    
                nx += dx;
                ny += dy;
            }
        });
    
        console.log("Valid queen moves:", moves); 
        return moves
    }
    
    movePiece(from, to, captured = null) {
        const [fromRow, fromCol] = from;
        const [toRow, toCol] = to;
    
        const piece = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null; 
        this.board[toRow][toCol] = piece; 

        if (piece === "WK" || piece === "BK") {
            if (captured) {
                const [capturedRow, capturedCol] = captured;
                this.board[capturedRow][capturedCol] = null; 
                this.updatePieceCounts();
            }
        } else if (Math.abs(fromRow - toRow) === 2) {
            const capturedRow = (fromRow + toRow) / 2;
            const capturedCol = (fromCol + toCol) / 2;
            this.board[capturedRow][capturedCol] = null; 
            this.updatePieceCounts();
        }
    
        if (piece === "W" && toRow === 0) this.board[toRow][toCol] = "WK";
        if (piece === "B" && toRow === 7) this.board[toRow][toCol] = "BK";
    
        this.moveHistory.push({ from, to, captured, piece });
    }
    
    
    
    
    
    isCaptureMandatory(player) {
        return this.generateMoves(player).some(([from, to]) => 
            Math.abs(from[0] - to[0]) === 2
        );
    }
    

    generateMoves(player) {
        const moves = new Set(); 
        this.board.forEach((row, x) => {
            row.forEach((cell, y) => {
                if (cell?.[0] === player) {
                    const pieceMoves = this.getValidMoves([x, y]);
                    pieceMoves.forEach(move => moves.add(JSON.stringify(move)));
                }
            });
        });
        return [...moves].map(move => JSON.parse(move)); 
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
