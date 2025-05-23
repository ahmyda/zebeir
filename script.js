// === Global Variables ===
let questions = [];
let currentIndex = 0;
let score = 0;
let timeLeft = 60;
let timerInterval;
let knownSet = new Set();        // Stores questions user marked as known
let favoriteSet = new Set();     // Stores questions user marked as favorite

// === Load Deck from JSON ===
async function loadDeck(deckName) {
  try {
    const response = await fetch(`decks/${deckName}.json`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const deck = await response.json();

    // Filter out known cards
    questions = deck.filter(q => !knownSet.has(q.question));

    currentIndex = 0;
    score = 0;
    timeLeft = 60;

    document.getElementById("score").textContent = "Score: 0";
    document.getElementById("timer").textContent = "Time left: 60s";

    showCard();
    startTimer();
  } catch (error) {
    console.error("❌ Error loading deck:", error);
    alert("Failed to load selected deck. Check console for details.");
  }
}

// === Show Current Card ===
function showCard() {
  if (questions.length === 0) {
    document.getElementById("flashcard-question").textContent = "No questions found!";
    document.getElementById("flashcard-answer").textContent = "";
    return;
  }

  const questionElem = document.getElementById("flashcard-question");
  const answerElem = document.getElementById("flashcard-answer");
  const card = document.getElementById("card");

  card.classList.remove("flipped");
  const q = questions[currentIndex];

  questionElem.textContent = q.question;
  answerElem.textContent = q.answer;

  // Update favorite button text
  document.querySelector(".action-buttons button:nth-child(2)").textContent =
    favoriteSet.has(q.question) ? "⭐ Favorited" : "⭐ Favorite";

  updateProgress();
}

// === Flip Card ===
function toggleCard() {
  document.getElementById("card").classList.toggle("flipped");
}

// === Go to Next Card ===
function nextCard() {
  currentIndex = (currentIndex + 1) % questions.length;
  showCard();
}

// === Mark as Known (Skip in future) ===
function markKnown() {
  const q = questions[currentIndex];
  knownSet.add(q.question);
  saveKnownToFavorites(); // Save to localStorage
  nextCard();
}

// === Mark as Favorite ===
function markFavorite() {
  const q = questions[currentIndex];
  if (favoriteSet.has(q.question)) {
    favoriteSet.delete(q.question);
  } else {
    favoriteSet.add(q.question);
  }
  saveKnownToFavorites(); // Save to localStorage

  document.querySelector(".action-buttons button:nth-child(2)").textContent =
    favoriteSet.has(q.question) ? "⭐ Favorited" : "⭐ Favorite";
}

// === Start Game with Timer ===
function startGame() {
  const selectedDeck = document.getElementById("deck-select").value;
  loadDeck(selectedDeck);
}

// === Start Timer ===
function startTimer() {
  clearInterval(timerInterval); // Reset if already running

  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = `Time left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      document.getElementById("flashcard-question").textContent = "⏰ Time's up!";
      document.getElementById("flashcard-answer").textContent = `Your score: ${score}`;
    }
  }, 1000);
}

// === View Favorites ===
function viewFavorites() {
  if (favoriteSet.size === 0) {
    alert("You haven't added any favorites yet.");
    return;
  }

  // Convert favorites to question objects
  questions = Array.from(favoriteSet).map(fav => {
    const match = questions.find(q => q.question === fav);
    return match || { question: fav, answer: "Saved Answer" };
  });

  currentIndex = 0;
  score = 0;
  timeLeft = 60;
  document.getElementById("score").textContent = "Score: 0";
  document.getElementById("timer").textContent = "Time left: --";

  showCard();
}

// === Update Progress Info ===
function updateProgress() {
  const total = questions.length;
  const remaining = total - knownSet.size;
  document.getElementById("progress").textContent = `Remaining: ${remaining}`;
}

// === LocalStorage: Save & Load ===

// Save favorites and known cards
function saveKnownToFavorites() {
  localStorage.setItem("knownSet", JSON.stringify(Array.from(knownSet)));
  localStorage.setItem("favoriteSet", JSON.stringify(Array.from(favoriteSet)));
}

// Load saved sets on page load
function loadKnownAndFavorites() {
  const savedKnown = localStorage.getItem("knownSet");
  const savedFav = localStorage.getItem("favoriteSet");

  if (savedKnown) knownSet = new Set(JSON.parse(savedKnown));
  if (savedFav) favoriteSet = new Set(JSON.parse(savedFav));
}

// === Run on Page Load ===
window.addEventListener("DOMContentLoaded", () => {
  loadKnownAndFavorites();
});