// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 1. REPLACE THIS with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAhhGzyMUJrfzYsOw4Uy-qu6F_IOqrh3PA",
  authDomain: "dingo-v2-0.firebaseapp.com",
  databaseURL: "https://dingo-v2-0-default-rtdb.firebaseio.com",
  projectId: "dingo-v2-0",
  storageBucket: "dingo-v2-0.firebasestorage.app",
  messagingSenderId: "908358383631",
  appId: "1:908358383631:web:09473d12f079a230134b7a",
  measurementId: "G-MFTX32JEDJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- MESSAGE BUTTON AUTO-CLOSE LOGIC ---
const openMessageBtn = document.getElementById('openMessageBtn');
const messageBox = document.getElementById('messageBox');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');

// Open the message box
openMessageBtn.addEventListener('click', () => {
    messageBox.style.display = 'block';
    openMessageBtn.disabled = true; // Lock the open button
});

// Send message and auto-close
sendMessageBtn.addEventListener('click', () => {
    const text = messageInput.value;
    if (text.trim() !== "") {
        // Push message to Firebase Realtime Database
        const messagesRef = ref(db, 'messages');
        const newMessageRef = push(messagesRef);
        set(newMessageRef, {
            text: text,
            timestamp: Date.now()
        });

        // Clear input, close box, and unlock button
        messageInput.value = '';
        messageBox.style.display = 'none';
        openMessageBtn.disabled = false; 
    }
});

// --- 5-IN-A-ROW (BINGO/WIN) LOGIC ---
const boardSize = 5;
const boardElement = document.getElementById('board');
let grid = Array(boardSize).fill(null).map(() => Array(boardSize).fill(''));
let currentPlayer = 'X';

// Create the board UI
for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener('click', handleCellClick);
        boardElement.appendChild(cell);
    }
}

function handleCellClick(e) {
    const r = parseInt(e.target.dataset.row);
    const c = parseInt(e.target.dataset.col);

    if (grid[r][c] !== '') return; // Prevent overwriting

    grid[r][c] = currentPlayer;
    e.target.innerText = currentPlayer;

    checkWin(r, c, currentPlayer);

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Switch turns
}

function checkWin(r, c, player) {
    // Check horizontal, vertical, and both diagonals
    if (checkLine(r, 0, 0, 1, player) || // Horizontal
        checkLine(0, c, 1, 0, player) || // Vertical
        checkLine(0, 0, 1, 1, player) || // Diagonal \
        checkLine(0, boardSize - 1, 1, -1, player)) { // Diagonal /
        
        console.log(`${player} got 5 in a row!`);
    }
}

function checkLine(startRow, startCol, rowStep, colStep, player) {
    let count = 0;
    let winningCells = [];

    for (let i = 0; i < boardSize; i++) {
        let r = startRow + (i * rowStep);
        let c = startCol + (i * colStep);

        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && grid[r][c] === player) {
            count++;
            // Find the specific DOM element to apply the effect
            let cellElement = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            winningCells.push(cellElement);
        }
    }

    if (count === boardSize) {
        // Apply the visual win effect to the 5 matching cells
        winningCells.forEach(cell => cell.classList.add('win-effect'));
        return true;
    }
    return false;
                  }
