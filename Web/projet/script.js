/* ================================================================
   TRIVIA MASTER — script.js
   Features: Combo multiplier, Survival mode, Leaderboard (localStorage),
             Particle burst, Card slide transitions, Streak tracker,
             Circular timer, Animated donut result, Animated BG
   ================================================================ */

// ── CONFIG ───────────────────────────────────────────────────────
const BASE_API = "https://opentdb.com/api.php?amount=10&type=multiple";
const TIMER_MAX = 15;
const CIRCUMFERENCE = 2 * Math.PI * 26; // ring r=26

// ── STATE ─────────────────────────────────────────────────────────
let questions = [], currentIndex = 0;
let points = 0;            // weighted score
let correctCount = 0;
let streak = 0, bestStreak = 0;
let multiplier = 1;
let used5050 = false, usedFreeze = false, isFrozen = false;
let timeLeft = TIMER_MAX;
let timerInterval = null;
let lives = 3;
let gameMode = 'classic';
let answerTimes = [];
let questionStart = 0;
let currentCategory = '';

// ── DOM ───────────────────────────────────────────────────────────
const screens      = { start: $('#start-screen'), quiz: $('#quiz-screen'), result: $('#result-screen') };
const progressFill = $('#progress-fill');
const progressText = $('#progress-text');
const timerNum     = $('#timer-num');
const timerRingFg  = $('#timer-ring-fg');
const questionCard = $('#question-card');
const questionText = $('#question-text');
const questionCat  = $('#question-category');
const optsCont     = $('#options-container');
const liveScore    = $('#live-score');
const streakCount  = $('#streak-count');
const streakDisplay= $('#streak-display');
const multiBadge   = $('#multiplier-badge');
const livesBar     = $('#lives-bar');
const startBtn     = $('#start-btn');
const restartBtn   = $('#restart-btn');
const btn5050      = $('#joker-5050');
const btnFreeze    = $('#joker-freeze');
const finalScoreNum= $('#final-score-num');
const finalScoreDen= $('#final-score-denom');
const recordMsg    = $('#record-msg');
const statStreak   = $('#stat-streak');
const statPoints   = $('#stat-points');
const statTime     = $('#stat-time');
const donutFg      = $('#donut-fg');
const resultEmoji  = $('#result-emoji');
const playerName   = $('#player-name');
const saveScoreBtn = $('#save-score-btn');
const lbList       = $('#leaderboard-list');

function $(sel) { return document.querySelector(sel); }

// ── AUDIO (Web Audio API) ─────────────────────────────────────────
let audioCtx;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function beep(freq, type, duration, vol = 0.3) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch(e) {}
}

function playCorrect() { beep(660, 'sine', 0.18, 0.25); setTimeout(() => beep(880, 'sine', 0.22, 0.2), 80); }
function playWrong()   { beep(220, 'sawtooth', 0.25, 0.2); }
function playTick()    { beep(880, 'square', 0.06, 0.05); }
function playFreeze()  { beep(1200, 'sine', 0.08, 0.12); setTimeout(() => beep(900, 'sine', 0.1, 0.15), 60); }

// ── BACKGROUND CANVAS ────────────────────────────────────────────
(function initBg() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  const particles = [];
  const COUNT = 55;

  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.18,
      dy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.4 + 0.05
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,168,83,${p.alpha})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = innerWidth;
      if (p.x > innerWidth) p.x = 0;
      if (p.y < 0) p.y = innerHeight;
      if (p.y > innerHeight) p.y = 0;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── PARTICLES BURST ───────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let sparks = [];

  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  window.burstParticles = function(x, y, color) {
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      sparks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        r: Math.random() * 3 + 1.5,
        color,
        decay: Math.random() * 0.02 + 0.02
      });
    }
  };

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sparks = sparks.filter(s => s.alpha > 0.01);
    sparks.forEach(s => {
      s.x += s.vx; s.y += s.vy;
      s.vy += 0.12;
      s.alpha -= s.decay;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color.replace('1)', `${s.alpha})`);
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }
  loop();
})();

// ── SCREEN TRANSITIONS ────────────────────────────────────────────
function showScreen(name) {
  Object.entries(screens).forEach(([k, el]) => {
    if (k === name) {
      el.classList.remove('exit');
      el.classList.add('active');
    } else if (el.classList.contains('active')) {
      el.classList.add('exit');
      el.classList.remove('active');
      setTimeout(() => el.classList.remove('exit'), 500);
    }
  });
}

// ── LEADERBOARD ───────────────────────────────────────────────────
function getScores() {
  try { return JSON.parse(localStorage.getItem('trivia_scores') || '[]'); }
  catch(e) { return []; }
}

function saveScore(name, pts, total) {
  const scores = getScores();
  scores.push({ name: name || 'Anonyme', pts, total, date: new Date().toLocaleDateString('fr-FR') });
  scores.sort((a, b) => b.pts - a.pts);
  scores.splice(5); // keep top 5
  localStorage.setItem('trivia_scores', JSON.stringify(scores));
  renderLeaderboard();
}

function renderLeaderboard() {
  const scores = getScores();
  if (!scores.length) {
    lbList.innerHTML = '<span class="no-scores">Aucun score enregistré</span>';
    return;
  }
  const medals = ['🥇','🥈','🥉','④','⑤'];
  lbList.innerHTML = scores.map((s, i) => `
    <div class="lb-row">
      <span class="lb-rank">${medals[i]}</span>
      <span class="lb-name">${escapeHTML(s.name)}</span>
      <span class="lb-pts">${s.pts} pts</span>
      <span class="lb-tag">${s.date}</span>
    </div>
  `).join('');
}

function getBestScore() {
  const scores = getScores();
  return scores.length ? scores[0].pts : 0;
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ── HELPERS ───────────────────────────────────────────────────────
function decode(html) {
  const t = document.createElement('textarea');
  t.innerHTML = html;
  return t.value;
}

function setTimerRing(fraction) {
  const offset = CIRCUMFERENCE * (1 - fraction);
  timerRingFg.style.strokeDashoffset = offset;
}

function updateMultiplierBadge() {
  multiBadge.textContent = `×${multiplier}`;
  if (multiplier > 1) {
    multiBadge.classList.add('visible');
  } else {
    multiBadge.classList.remove('visible');
  }
}

function popScore() {
  liveScore.textContent = points;
  liveScore.classList.add('pop');
  setTimeout(() => liveScore.classList.remove('pop'), 220);
}

function renderLives() {
  if (gameMode !== 'survival') { livesBar.innerHTML = ''; return; }
  livesBar.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const pip = document.createElement('div');
    pip.className = 'life-pip' + (i >= lives ? ' lost' : '');
    livesBar.appendChild(pip);
  }
}

// ── QUIZ START ────────────────────────────────────────────────────
async function startQuiz() {
  currentIndex = 0; points = 0; correctCount = 0;
  streak = 0; bestStreak = 0; multiplier = 1;
  used5050 = false; usedFreeze = false; isFrozen = false;
  answerTimes = [];
  gameMode = $('#game-mode').value;
  lives = 3;

  btn5050.disabled = false;
  btnFreeze.disabled = false;
  liveScore.textContent = '0';
  streakCount.textContent = '0';
  streakDisplay.classList.remove('active');
  updateMultiplierBadge();
  renderLives();

  showScreen('quiz');

  const diff   = $('#difficulty').value;
  const cat    = $('#category').value;
  const catName= $('#category').options[$('#category').selectedIndex].text;
  currentCategory = catName;
  const url    = `${BASE_API}&difficulty=${diff}&category=${cat}`;

  try {
    const res  = await fetch(url);
    const data = await res.json();
    questions  = data.results.map(q => ({
      question: q.question,
      correct: q.correct_answer,
      answers: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5)
    }));
    showQuestion();
  } catch (e) {
    questionText.textContent = "❌ Erreur de connexion à l'API. Réessaie.";
  }
}

// ── SHOW QUESTION ─────────────────────────────────────────────────
async function showQuestion() {
  clearInterval(timerInterval);
  isFrozen = false;

  const q = questions[currentIndex];

  // Card transition
  questionCard.classList.add('slide-out');
  await sleep(200);
  questionCard.classList.remove('slide-out');

  progressText.textContent  = `${currentIndex + 1} / ${questions.length}`;
  progressFill.style.width  = `${((currentIndex + 1) / questions.length) * 100}%`;
  questionCat.textContent   = currentCategory.toUpperCase();
  questionText.textContent  = decode(q.question);

  questionCard.classList.add('slide-in');
  setTimeout(() => questionCard.classList.remove('slide-in'), 400);

  // Options
  optsCont.innerHTML = '';
  q.answers.forEach(ans => {
    const btn = document.createElement('button');
    btn.className   = 'option-btn';
    btn.textContent = decode(ans);
    btn.onclick = () => handleAnswer(ans, q.correct, btn);
    optsCont.appendChild(btn);
  });

  btn5050.disabled  = used5050;
  btnFreeze.disabled= usedFreeze;

  questionStart = Date.now();
  startTimer();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── TIMER ─────────────────────────────────────────────────────────
function startTimer() {
  timeLeft = TIMER_MAX;
  setTimerRing(1);
  timerNum.textContent = timeLeft;
  timerNum.classList.remove('critical');
  timerRingFg.classList.remove('critical');

  timerInterval = setInterval(() => {
    if (isFrozen) return;
    timeLeft--;
    timerNum.textContent = timeLeft;
    setTimerRing(timeLeft / TIMER_MAX);

    if (timeLeft <= 5) {
      timerNum.classList.add('critical');
      timerRingFg.classList.add('critical');
      playTick();
    }
    if (timeLeft <= 0) {
      handleAnswer(null, questions[currentIndex].correct, null);
    }
  }, 1000);
}

// ── HANDLE ANSWER ─────────────────────────────────────────────────
function handleAnswer(selected, correct, btn) {
  clearInterval(timerInterval);
  timerNum.classList.remove('critical');
  timerRingFg.classList.remove('critical');
  isFrozen = false;

  const elapsed = (Date.now() - questionStart) / 1000;
  answerTimes.push(Math.min(elapsed, TIMER_MAX));

  const allBtns = optsCont.querySelectorAll('.option-btn');
  allBtns.forEach(b => b.disabled = true);
  btn5050.disabled = true;
  btnFreeze.disabled = true;

  const decodedCorrect = decode(correct);
  const isCorrect = selected && (decode(selected) === decodedCorrect || selected === correct);

  if (isCorrect) {
    // Points = base 100 × multiplier × time bonus
    const timeBonus = Math.ceil((timeLeft / TIMER_MAX) * 50);
    const gained = (100 + timeBonus) * multiplier;
    points += gained;
    correctCount++;
    streak++;
    bestStreak = Math.max(bestStreak, streak);

    // Multiplier ramp: 1 → 1.5 → 2 → 3 after 3, 5, 7 correct
    if (streak >= 7)      multiplier = 3;
    else if (streak >= 5) multiplier = 2;
    else if (streak >= 3) multiplier = 1.5;
    else                  multiplier = 1;

    streakCount.textContent = streak;
    if (streak >= 2) streakDisplay.classList.add('active');

    updateMultiplierBadge();
    popScore();
    playCorrect();

    if (btn) {
      btn.classList.add('correct');
      // Burst particles at button center
      const rect = btn.getBoundingClientRect();
      burstParticles(rect.left + rect.width/2, rect.top + rect.height/2, 'rgba(61,214,140,');
    }
  } else {
    streak = 0;
    multiplier = 1;
    streakCount.textContent = 0;
    streakDisplay.classList.remove('active');
    updateMultiplierBadge();
    playWrong();

    if (btn) btn.classList.add('wrong');
    // Reveal correct answer
    Array.from(allBtns).find(b => b.textContent === decodedCorrect)?.classList.add('correct');

    if (navigator.vibrate) navigator.vibrate(220);

    if (gameMode === 'survival') {
      lives--;
      renderLives();
      if (lives <= 0) {
        setTimeout(showEnd, 1500);
        return;
      }
    }
  }

  setTimeout(() => {
    if (currentIndex + 1 < questions.length) {
      currentIndex++;
      showQuestion();
    } else {
      showEnd();
    }
  }, 1500);
}

// ── 50/50 ─────────────────────────────────────────────────────────
function use5050() {
  if (used5050) return;
  used5050 = true;
  btn5050.disabled = true;

  const btns = Array.from(optsCont.querySelectorAll('.option-btn'));
  const correct = decode(questions[currentIndex].correct);
  const wrong = btns.filter(b => b.textContent !== correct);
  wrong.sort(() => Math.random() - 0.5).slice(0, 2).forEach(b => {
    b.style.visibility = 'hidden';
    b.disabled = true;
  });
}

// ── FREEZE ────────────────────────────────────────────────────────
function useFreeze() {
  if (usedFreeze) return;
  usedFreeze = true;
  isFrozen = true;
  btnFreeze.disabled = true;
  playFreeze();

  timerNum.textContent = '❄';
  timerRingFg.style.stroke = '#60a5fa';

  setTimeout(() => {
    if (!$('#quiz-screen').classList.contains('active')) return;
    isFrozen = false;
    timerNum.textContent = timeLeft;
    timerRingFg.style.stroke = '';
  }, 10000);
}

// ── END GAME ──────────────────────────────────────────────────────
function showEnd() {
  clearInterval(timerInterval);
  isFrozen = false;

  const total   = questions.length;
  const avgTime = answerTimes.length
    ? (answerTimes.reduce((a,b) => a+b, 0) / answerTimes.length).toFixed(1)
    : '-';

  // Fill result
  finalScoreNum.textContent = correctCount;
  finalScoreDen.textContent = `/ ${total}`;
  statStreak.textContent    = bestStreak;
  statPoints.textContent    = `${points} pts`;
  statTime.textContent      = `${avgTime}s`;

  // Emoji based on score
  const pct = correctCount / total;
  resultEmoji.textContent = pct === 1 ? '🏆' : pct >= 0.7 ? '🎯' : pct >= 0.4 ? '😅' : '💀';

  // Donut animation
  const donutCirc = 314;
  const offset = donutCirc * (1 - (correctCount / total));
  requestAnimationFrame(() => {
    donutFg.style.strokeDashoffset = offset;
  });

  // Record?
  const prev = getBestScore();
  if (points > prev && correctCount > 0) {
    recordMsg.classList.remove('hidden');
    // Burst all over
    setTimeout(() => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          burstParticles(
            innerWidth * (0.2 + Math.random() * 0.6),
            innerHeight * (0.2 + Math.random() * 0.4),
            'rgba(212,168,83,'
          );
        }, i * 180);
      }
    }, 500);
  } else {
    recordMsg.classList.add('hidden');
  }

  showScreen('result');
}

// ── SAVE SCORE ────────────────────────────────────────────────────
saveScoreBtn.onclick = () => {
  const name = playerName.value.trim();
  saveScore(name, points, questions.length);
  saveScoreBtn.textContent = '✓ SAUVEGARDÉ';
  saveScoreBtn.disabled = true;
};

// ── EVENTS ────────────────────────────────────────────────────────
startBtn.onclick  = startQuiz;
restartBtn.onclick= () => {
  saveScoreBtn.textContent = 'SAUVEGARDER';
  saveScoreBtn.disabled = false;
  playerName.value = '';
  startQuiz();
};
btn5050.onclick   = use5050;
btnFreeze.onclick = useFreeze;

// ── INIT ─────────────────────────────────────────────────────────
renderLeaderboard();
showScreen('start');