const gridContainer = document.getElementById("game-grid");
const movesDisplay = document.getElementById("moves-count");
const matchesDisplay = document.getElementById("matches-count");
const restartBtn = document.getElementById("restart-btn");

// Emojis/Icons array (8 pairs = 16 cards)
const cardIcons = ['🚀', '🛸', '💎', '🎨', '🔥', '🧠', '👑', '⚡', '🚀', '🛸', '💎', '🎨', '🔥', '🧠', '👑', '⚡'];

let flippedCards = [];
let moves = 0;
let matches = 0;
let isLockBoard = false;

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
        // Short Light Click Sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    } 
    else if (type === 'match') {
        // Success Chime (Two quick rising notes)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // Note C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // Note E5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
    } 
    else if (type === 'win') {
        // Victory Retro Sound (Rising Arpeggio)
        osc.type = 'square';
        osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
        osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.1); // E4
        osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.2); // G4
        osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.3); // C5
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
    
    movesDisplay.textContent = moves;
    matchesDisplay.textContent = matches;

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

    // Play Flip Sound instantly on click
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
            playSystemSound('win'); // Win sound
            alert(`Amazing! You completed the game in ${moves} moves.`);
        }, 500);
    } else {
        setTimeout(() => {
            playSystemSound('match'); // Match sound
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

restartBtn.addEventListener("click", initGame);

// Start game on load
initGame();