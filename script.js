// Hapus nama pemain dari sessionStorage saat halaman dimuat
sessionStorage.removeItem('playerName');

// Pastikan nama pemain diambil dari prompt dan disimpan di sessionStorage
let playerName = window.prompt("Siapa Nama Anda?");
sessionStorage.setItem('playerName', playerName);

document.getElementById('welcome-message').textContent = "Hallo " + playerName + "! Selamat Datang dan Selamat Bermain di Permainan";
// Variabel dan fungsi game
const statusDisplay = document.querySelector('.game--status');
let gameActive = true;
let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];
let firstPlayer = "user";  // Default start player

const clickSound = document.getElementById('click-sound');
const moveSound = document.getElementById('move-sound');
const backSound = document.getElementById('back-sound');

const winningMessage = () => `Player ${currentPlayer === "X" ? playerName : "Computer"} has won!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `It's ${currentPlayer === "X" ? playerName : "Computer"}'s turn`;

// Pemutaran backsound saat promp muncul
window.onload = () => {
    backSound.play();
    clickSound.play(); // Pastikan suara klik juga diputar saat halaman dimuat
};

// Menghentikan pemutaran backsound setelah prompt ditampilkan
backSound.pause();
backSound.currentTime = 0;




statusDisplay.innerHTML = currentPlayerTurn();


const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    moveSound.play();
}

function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.innerHTML = currentPlayerTurn();
}

function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        gameActive = false;
        return;
    }

    if (!gameState.includes("")) {
        statusDisplay.innerHTML = drawMessage();
        gameActive = false;
        return;
    }

    handlePlayerChange();

    if (currentPlayer === "O" && gameActive) {
        setTimeout(() => {
            const bestMove = findBestMove(gameState);
            handleCellPlayed(document.querySelector(`[data-cell-index='${bestMove}']`), bestMove);
            handleResultValidation();
        }, 500);
    }
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

function handleRestartGame() {
    gameActive = true;
    currentPlayer = firstPlayer === "user" ? "X" : "O";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = currentPlayerTurn();
    document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = "");

    backSound.currentTime = 0;
    backSound.play();

    if (firstPlayer === "computer") {
        setTimeout(() => {
            const bestMove = findBestMove(gameState);
            handleCellPlayed(document.querySelector(`[data-cell-index='${bestMove}']`), bestMove);
            handleResultValidation();
        }, 500);
    }
}

function minimax(newGameState, depth, isMaximizing) {
    const scores = {
        'X': -10,
        'O': 10,
        'draw': 0
    };

    let winner = checkWinner(newGameState);
    if (winner !== null) {
        return scores[winner];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < newGameState.length; i++) {
            if (newGameState[i] === "") {
                newGameState[i] = "O";
                let score = minimax(newGameState, depth + 1, false);
                newGameState[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < newGameState.length; i++) {
            if (newGameState[i] === "") {
                newGameState[i] = "X";
                let score = minimax(newGameState, depth + 1, true);
                newGameState[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function findBestMove(newGameState) {
    let bestMove = -1;
    let bestScore = -Infinity;
    let possibleMoves = [];

    for (let i = 0; i < newGameState.length; i++) {
        if (newGameState[i] === "") {
            newGameState[i] = "O";
            let score = minimax(newGameState, 0, false);
            newGameState[i] = "";
            if (score > bestScore) {
                bestScore = score;
                possibleMoves = [i]; // Reset possible moves with the new best move
            } else if (score === bestScore) {
                possibleMoves.push(i); // Add to possible moves if the score is the same
            }
        }
    }

    // Choose a random move from the possible best moves
    bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    return bestMove;
}

function checkWinner(newGameState) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (newGameState[a] && newGameState[a] === newGameState[b] && newGameState[a] === newGameState[c]) {
            return newGameState[a];
        }
    }
    return newGameState.includes("") ? null : 'draw';
}

document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('.game--restart').addEventListener('click', () => {
    clickSound.play();
    handleRestartGame();
});
document.querySelectorAll('.start-player').forEach(button => {
    button.addEventListener('click', (event) => {
        clickSound.play();
        firstPlayer = event.target.getAttribute('data-player');
        handleRestartGame();
    });
});


