console.log("SCRIPT VERSION: CLEAN BUILD 5");

/* =========================
   STATE
========================= */

let current = 0;
let userAnswers = {};
let shuffledOptions = {};

/* =========================
   BRAHMI MEMES (DIRECT GIFS)
========================= */

const MEMES = {
  correct: "memes/correct.gif",
  wrong: "memes/wrong.gif",
  result: {
    low: "memes/low.gif",
    mid: "memes/mid.gif",
    high: "memes/high.gif"
  }
};


/* =========================
   MEME HELPERS (FIXED)
========================= */

function showMeme(src) {
  const memeBox = document.getElementById("memeBox");
  if (!memeBox) return;

  memeBox.innerHTML = `
    <img 
      src="${src}" 
      alt="meme"
      style="
        max-width:100%;
        max-height:200px;
        border-radius:10px;
        margin-top:12px;
        box-shadow:0 4px 12px rgba(0,0,0,0.3);
      "
    >
  `;

  memeBox.style.display = "block";
}

function hideMeme() {
  const memeBox = document.getElementById("memeBox");
  if (!memeBox) return;

  memeBox.innerHTML = "";
  memeBox.style.display = "none";
}

/* =========================
   THEME
========================= */

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

/* =========================
   UTILITIES
========================= */

function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* =========================
   MAIN LOGIC
========================= */

function loadQuestion() {
  hideMeme();

  const q = questions[current];
  if (!q) return;

  document.getElementById("section").innerText = "Section " + q.section;
  document.getElementById("question").innerText = q.question;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  if (!shuffledOptions[current]) {
    shuffledOptions[current] = shuffleArray([...q.options]);
  }

  const labels = ["A", "B", "C", "D", "E"];

  shuffledOptions[current].forEach((option, index) => {
    if (!option) return;

    const div = document.createElement("div");
    div.className = "option";

    div.innerHTML = `
      <span class="opt-label">${labels[index]}.</span>
      <span>${option}</span>
    `;

    if (userAnswers[current] === option) {
      div.classList.add("selected");
    }

    div.onclick = () => selectOption(option);
    optionsDiv.appendChild(div);
  });

  showFeedback();
  loadTiles();
}

function selectOption(option) {
  userAnswers[current] = option;
  loadQuestion();
}

/* =========================
   FEEDBACK + MEMES
========================= */

function showFeedback() {
  const q = questions[current];
  const feedback = document.getElementById("feedback");
  const user = userAnswers[current];

  if (!user) {
    feedback.innerHTML = "";
    hideMeme();
    return;
  }

  if (user === q.answer) {
    feedback.innerHTML = `<p style="color:green;">Correct ✅</p>`;
    showMeme(MEMES.correct);
  } else {
    feedback.innerHTML = `
      <p style="color:red;">Wrong ❌</p>
      <p style="color:green;">Correct Answer: ${q.answer}</p>
    `;
    showMeme(MEMES.wrong);
  }
}

/* =========================
   NAVIGATION
========================= */

function nextQuestion() {
  if (current < questions.length - 1) {
    current++;
    loadQuestion();
  }
}

function prevQuestion() {
  if (current > 0) {
    current--;
    loadQuestion();
  }
}

function skipQuestion() {
  nextQuestion();
}

/* =========================
   TILES
========================= */

function loadTiles() {
  const tilesDiv = document.getElementById("tiles");
  const heading = document.getElementById("tileHeading");

  tilesDiv.innerHTML = "";

  const section = questions[current].section;
  heading.innerText = `Section ${section}`;

  const start = (section - 1) * 50;
  const end = Math.min(start + 50, questions.length);

  for (let i = start; i < end; i++) {
    const btn = document.createElement("button");
    btn.innerText = i + 1;

    if (userAnswers[i]) btn.classList.add("answered");
    if (i === current) btn.classList.add("current");

    btn.onclick = () => {
      current = i;
      loadQuestion();
      if (window.innerWidth <= 900) {
        document.getElementById("tilesPanel").classList.remove("open");
      }
    };

    tilesDiv.appendChild(btn);
  }
}

function goToSection(sectionNumber) {
  const index = questions.findIndex(q => q.section === sectionNumber);
  if (index !== -1) {
    current = index;
    loadQuestion();
  }
}

/* =========================
   SUBMIT / RESULT
========================= */

function finishExam() {
  let score = 0;

  questions.forEach((q, i) => {
    if (userAnswers[i] === q.answer) score++;
  });

  const percentage = Math.round((score / questions.length) * 100);

  let gif = MEMES.result.low;
  if (percentage >= 81) gif = MEMES.result.high;
  else if (percentage >= 61) gif = MEMES.result.mid;

  const resultPanel = document.getElementById("resultPanel");
  resultPanel.innerHTML = `
    <h2>Result</h2>
    <h1 style="font-size:48px;">${score} / ${questions.length}</h1>
    <p>Percentage: ${percentage}%</p>
    <div class="meme-box">
      <img src="${gif}" style="max-width:100%; border-radius:10px;">
    </div>
    <button onclick="reattemptExam()">Reattempt</button>
  `;

  resultPanel.style.display = "block";

  document.getElementById("options").style.display = "none";
  document.getElementById("feedback").style.display = "none";
  document.getElementById("navButtons").style.display = "none";
  document.getElementById("tilesPanel").style.display = "none";
  document.getElementById("submitBtn").style.display = "none";

  hideMeme();
}

/* =========================
   REATTEMPT
========================= */

function reattemptExam() {
  userAnswers = {};
  shuffledOptions = {};
  current = 0;

  document.getElementById("resultPanel").style.display = "none";
  document.getElementById("options").style.display = "block";
  document.getElementById("feedback").style.display = "block";
  document.getElementById("navButtons").style.display = "flex";
  document.getElementById("tilesPanel").style.display = "block";
  document.getElementById("submitBtn").style.display = "inline-block";

  hideMeme();
  loadQuestion();
}

/* =========================
   UI HELPERS
========================= */

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

function toggleTiles() {
  document.getElementById("tilesPanel").classList.toggle("open");
}

/* =========================
   START
========================= */

loadQuestion();
