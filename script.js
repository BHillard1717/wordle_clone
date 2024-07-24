const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
let validWords = new Set();
let secretWord = '';
let currentGuess = '';
let guesses = Array(MAX_GUESSES).fill('');
let currentRow = 0;
let gameOver = false;

const gridElement = document.getElementById('grid');
const messageElement = document.getElementById('message');
const restartButton = document.getElementById('restartButton');
console.log(restartButton)

async function loadWords() {
    try {
        const response = await fetch('valid_words.txt');
        const text = await response.text();
        validWords = new Set(text.split('\n').map(word => word.trim().toUpperCase()));
        secretWord = getRandomWord(Array.from(validWords));
        initializeGrid();
    } catch (error) {
        console.error('Failed to load words:', error);
        messageElement.textContent = 'Failed to load word list. Please refresh the page.';
    }
}

function getRandomWord(words) {
    return words[Math.floor(Math.random() * words.length)];
}

function initializeGrid() {
    gridElement.innerHTML = '';
    for (let i = 0; i < MAX_GUESSES; i++) {
        for (let j = 0; j < WORD_LENGTH; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${i}-${j}`;
            gridElement.appendChild(cell);
        }
    }
}

function updateGrid() {
    for (let i = 0; i < MAX_GUESSES; i++) {
        for (let j = 0; j < WORD_LENGTH; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            if (i < currentRow) {
                // Past guesses
                cell.textContent = guesses[i][j] || '';
                if (guesses[i][j] === secretWord[j]) {
                    cell.classList.add('correct');
                } else if (secretWord.includes(guesses[i][j])) {
                    cell.classList.add('present');
                } else {
                    cell.classList.add('absent');
                }
            } else if (i === currentRow) {
                // Current guess
                cell.textContent = currentGuess[j] || '';
                cell.className = 'cell'; // Reset classes
            } else {
                // Future guesses
                cell.textContent = '';
                cell.className = 'cell'; // Reset classes
            }
        }
    }
}

function handleKeyDown(event) {
    if (gameOver) return;

    if (event.key === 'Enter') {
        if (currentGuess.length !== WORD_LENGTH) {
            setMessage('Word must be 5 letters long');
            return;
        }
        if (!validWords.has(currentGuess)) {
            setMessage('Not a valid word');
            return;
        }
        guesses[currentRow] = currentGuess;
        updateGrid();
        if (currentGuess === secretWord) {
            gameOver = true;
            setMessage('Congratulations! You won!');
            showRestartButton();
        } else if (currentRow === MAX_GUESSES - 1) {
            gameOver = true;
            setMessage(`Game over. The word was ${secretWord}`);
            showRestartButton();
        } else {
            currentRow++;
            currentGuess = '';
            setMessage('');
        }
    } else if (event.key === 'Backspace') {
        currentGuess = currentGuess.slice(0, -1);
    } else if (event.key.match(/^[a-z]$/i)) {
        if (currentGuess.length < WORD_LENGTH) {
            currentGuess += event.key.toUpperCase();
        }
    }
    updateGrid();
}

function setMessage(msg) {
    messageElement.textContent = msg;
}

function showRestartButton() {
    restartButton.style.display = 'inline-block';
}

function restartGame() {
    secretWord = getRandomWord(Array.from(validWords));
    currentGuess = '';
    guesses = Array(MAX_GUESSES).fill('');
    currentRow = 0;
    gameOver = false;
    setMessage('');
    updateGrid();
    restartButton.style.display = 'none';
}

window.addEventListener('keydown', handleKeyDown);
restartButton.addEventListener('click', restartGame);

loadWords();