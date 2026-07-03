const gridContainer = document.getElementById("game-grid");
const movesDisplay = document.getElementById("moves-count");
const matchesDisplay = document.getElementById("matches-count");
const restartBtn = document.getElementById("restart-btn");
const previewBtn = document.getElementById("preview-btn");

// Congratulations Modal Selectors
const winModal = document.getElementById("win-modal");
const finalMovesDisplay = document.getElementById("final-moves");
const modalNewGameBtn = document.getElementById("modal-new-game-btn");

// Emojis/Icons array (8 pairs = 16 cards)
const cardIcons = ['🚀', '🛸', '💎', '🎨', '🔥', '🧠', '👑', '⚡', '🚀', '🛸', '💎', '🎨', '🔥', '🧠', '👑', '⚡'];

let flippedCards = [];
let moves = 0;
let matches = 0;
let isLockBoard = false;

// New variables for 3-times preview feature limit
let peekCount = 3; 

// Web Audio API Function - Browser khud sound generate karega
function playSystemSound(type) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'flip') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    } 
    else if (type === 'match') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
    } 
    else if (type === 'win') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(261.63, ctx.currentTime);
        osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initGame() {
    gridContainer.innerHTML = "";
    flippedCards = [];
    moves = 0;
    matches = 0;
    isLockBoard = false;
    
    // Reset preview limit for a new game
    peekCount = 3; 
    
    movesDisplay.textContent = moves;
    matchesDisplay.textContent = matches;
    
    // Preview button initial text aur state restore karein
    if (previewBtn) {
        previewBtn.disabled = false;
        previewBtn.innerHTML = `👁️ Peek (${peekCount})`;
    }

    const shuffledIcons = shuffle([...cardIcons]);

    shuffledIcons.forEach((icon, index) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.icon = icon;
        card.dataset.index = index;

        card.innerHTML = `
            <div class="card-front">${icon}</div>
            <div class="card-back"></div>
        `;

        card.addEventListener("click", flipCard);
        gridContainer.appendChild(card);
    });
}

function flipCard() {
    if (isLockBoard) return;
    if (this.classList.contains("flipped")) return;
    if (flippedCards.length === 1 && this.dataset.index === flippedCards[0].dataset.index) return;

    playSystemSound('flip');

    this.classList.add("flipped");
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.icon === card2.dataset.icon;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    flippedCards[0].classList.add("matched");
    flippedCards[1].classList.add("matched");
    
    matches++;
    matchesDisplay.textContent = matches;
    flippedCards = [];

    if (matches === cardIcons.length / 2) {
        setTimeout(() => {
            playSystemSound('win');
            finalMovesDisplay.textContent = moves;
            winModal.classList.add("show");
        }, 500);
    } else {
        setTimeout(() => {
            playSystemSound('match');
        }, 200);
    }
}

function unflipCards() {
    isLockBoard = true;

    setTimeout(() => {
        flippedCards[0].classList.remove("flipped");
        flippedCards[1].classList.remove("flipped");
        flippedCards = [];
        isLockBoard = false;
    }, 1000);
}

// 3-Seconds Eye Preview Logic with 3-Time Maximum Limit
function peekCards() {
    if (isLockBoard || peekCount <= 0) return;
    
    isLockBoard = true;
    peekCount--; // Clicks counter kam karein
    
    // Real-time button text aur visibility status control karein
    previewBtn.innerHTML = `👁️ Peek (${peekCount})`;
    previewBtn.disabled = true; 
    
    const allCards = document.querySelectorAll(".card");
    
    // Display all face icons
    allCards.forEach(card => card.classList.add("flipped"));
    playSystemSound('match');

    // Automatically hide them back after 3 seconds
    setTimeout(() => {
        allCards.forEach(card => {
            if (!card.classList.contains("matched")) {
                card.classList.remove("flipped");
            }
        });
        
        // Agar abhi clicks baqi hain to 3s baad board lock open aur button enable karein
        if (peekCount > 0) {
            isLockBoard = false;
            previewBtn.disabled = false;
        } else {
            isLockBoard = false; // Board normal gameplay ke liye khula rahega lekin btn lock rahega
        }
    }, 3000); 
}

// Event Listeners
restartBtn.addEventListener("click", initGame);
if (previewBtn) previewBtn.addEventListener("click", peekCards);

modalNewGameBtn.addEventListener("click", () => {
    winModal.classList.remove("show");
    initGame();
});

// Start game on load
initGame();