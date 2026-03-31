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
let peakMultiplier = 1;
let multiplier = 1;
let used5050 = false, usedFreeze = false, isFrozen = false;
let timeLeft = TIMER_MAX;
let timerInterval = null;
let lives = 3;
let gameMode = 'classic';
let answerTimes = [];
let answerResults = []; // 'correct' | 'wrong' | 'timeout'
let questionStart = 0;
let currentCategory = '';

// ── DOM ───────────────────────────────────────────────────────────
const screens      = { start: $('#start-screen'), quiz: $('#quiz-screen'), result: $('#result-screen'), stats: $('#stats-screen') };
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
const statsBtn     = $('#stats-btn');
const statsBackBtn = $('#stats-back-btn');

function $(sel) { return document.querySelector(sel); }

// ── AUDIO ENGINE (Web Audio API — fully adaptive) ─────────────────
let audioCtx;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Master compressor so nothing clips
    const comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.15;
    comp.connect(audioCtx.destination);
    audioCtx._master = comp;
  }
  return audioCtx;
}

function getOut() { const c = getAudioCtx(); return c._master; }

function tone(freq, type, start, duration, vol = 0.25, pitchEnd = null) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(getOut());
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    if (pitchEnd !== null)
      osc.frequency.linearRampToValueAtTime(pitchEnd, ctx.currentTime + start + duration);
    gain.gain.setValueAtTime(0, ctx.currentTime + start);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration + 0.05);
  } catch(e) {}
}

function noise(duration, vol = 0.08) {
  try {
    const ctx = getAudioCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = 1200; filt.Q.value = 0.5;
    src.connect(filt); filt.connect(gain); gain.connect(getOut());
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    src.start(); src.stop(ctx.currentTime + duration + 0.05);
  } catch(e) {}
}

// ── Correct: pitch rises with streak level ──────────────────────
function playCorrect(currentStreak = 0) {
  // Base interval — rises with streak
  const base = 440 + Math.min(currentStreak, 6) * 40;
  const third = base * 1.26;
  const fifth = base * 1.498;

  if (currentStreak >= 7) {
    // Full chord fanfare
    tone(base,  'sine',     0,    0.3, 0.2);
    tone(third, 'sine',     0.02, 0.3, 0.18);
    tone(fifth, 'sine',     0.04, 0.3, 0.16);
    tone(base * 2, 'sine',  0.1,  0.25, 0.12);
    noise(0.06, 0.06);
  } else if (currentStreak >= 5) {
    // Bright arpeggio
    tone(base,  'sine', 0,    0.18, 0.22);
    tone(third, 'sine', 0.07, 0.18, 0.2);
    tone(fifth, 'sine', 0.14, 0.22, 0.18);
  } else if (currentStreak >= 3) {
    // Double tone, ascending
    tone(base,  'sine', 0,    0.16, 0.22);
    tone(fifth, 'sine', 0.09, 0.2,  0.18);
  } else {
    // Simple rising pair
    tone(520, 'sine', 0,    0.14, 0.2);
    tone(780, 'sine', 0.08, 0.18, 0.18);
  }
}

// ── Wrong: harsher with longer wrong streaks ─────────────────────
function playWrong() {
  tone(220, 'sawtooth', 0,    0.15, 0.18, 180);
  tone(160, 'square',   0.08, 0.2,  0.12);
  noise(0.1, 0.06);
}

// ── Tick: urgency increases under 5s ────────────────────────────
function playTick(timeLeft = 5) {
  const freq = timeLeft <= 2 ? 1200 : timeLeft <= 4 ? 1000 : 880;
  const vol  = timeLeft <= 2 ? 0.12 : 0.07;
  tone(freq, 'square', 0, 0.05, vol);
}

// ── Combo level-up: plays on hitting 3, 5, 7 streak ─────────────
function playComboUp(level) {
  // Ascending sweep unique per level
  const freqs = { 3: [400, 600], 5: [500, 750, 1000], 7: [600, 900, 1200, 1500] };
  const seq = freqs[level] || [500, 800];
  seq.forEach((f, i) => tone(f, 'sine', i * 0.07, 0.12, 0.18));
}

// ── Freeze: icy shimmer ──────────────────────────────────────────
function playFreeze() {
  [1800, 1400, 1100, 900, 700].forEach((f, i) =>
    tone(f, 'sine', i * 0.055, 0.1, 0.1)
  );
}

// ── Fast answer bonus ─────────────────────────────────────────────
function playSpeedBonus() {
  tone(1047, 'sine', 0,    0.1, 0.15);
  tone(1319, 'sine', 0.06, 0.1, 0.15);
  tone(1568, 'sine', 0.12, 0.14, 0.12);
}

// ── Game over (survival) ──────────────────────────────────────────
function playGameOver() {
  tone(300, 'sawtooth', 0,    0.3, 0.2, 180);
  tone(240, 'sawtooth', 0.25, 0.4, 0.18, 120);
  tone(120, 'square',   0.55, 0.5, 0.15);
  noise(0.4, 0.08);
}

// ── Result fanfare ────────────────────────────────────────────────
function playResultFanfare(pct) {
  if (pct >= 0.9) {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', i * 0.1, 0.35, 0.15));
  } else if (pct >= 0.5) {
    tone(440, 'sine', 0, 0.2, 0.15);
    tone(554, 'sine', 0.15, 0.2, 0.12);
  } else {
    tone(330, 'triangle', 0, 0.3, 0.12, 280);
  }
}

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
  streak = 0; bestStreak = 0; multiplier = 1; peakMultiplier = 1;
  used5050 = false; usedFreeze = false; isFrozen = false;
  answerTimes = [];
  answerResults = [];
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
      playTick(timeLeft);
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
    const isSpeedBonus = timeLeft >= TIMER_MAX - 4; // answered in first 4s
    const gained = (100 + timeBonus) * multiplier;
    points += gained;
    correctCount++;
    streak++;
    bestStreak = Math.max(bestStreak, streak);

    // Multiplier ramp: 1 → 1.5 → 2 → 3 after 3, 5, 7 correct
    const prevMult = multiplier;
    if (streak >= 7)      multiplier = 3;
    else if (streak >= 5) multiplier = 2;
    else if (streak >= 3) multiplier = 1.5;
    else                  multiplier = 1;
    if (multiplier > peakMultiplier) peakMultiplier = multiplier;

    streakCount.textContent = streak;
    if (streak >= 2) streakDisplay.classList.add('active');

    updateMultiplierBadge();
    popScore();

    // Adaptive audio: combo level-up sound OR speed bonus OR regular
    if (multiplier > prevMult) {
      const lvl = streak >= 7 ? 7 : streak >= 5 ? 5 : 3;
      playComboUp(lvl);
    } else if (isSpeedBonus) {
      playSpeedBonus();
    } else {
      playCorrect(streak);
    }

    answerResults.push('correct');

    if (btn) {
      btn.classList.add('correct');
      const rect = btn.getBoundingClientRect();
      burstParticles(rect.left + rect.width/2, rect.top + rect.height/2, 'rgba(61,214,140,');
    }
  } else {
    const wasTimeout = selected === null;
    streak = 0;
    multiplier = 1;
    streakCount.textContent = 0;
    streakDisplay.classList.remove('active');
    updateMultiplierBadge();

    if (wasTimeout) {
      answerResults.push('timeout');
      playWrong();
    } else {
      answerResults.push('wrong');
      playWrong();
    }

    if (btn) btn.classList.add('wrong');
    Array.from(allBtns).find(b => b.textContent === decodedCorrect)?.classList.add('correct');

    if (navigator.vibrate) navigator.vibrate(220);

    if (gameMode === 'survival') {
      lives--;
      renderLives();
      if (lives <= 0) {
        playGameOver();
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

  // Fanfare on result
  setTimeout(() => playResultFanfare(correctCount / total), 400);
}

// ── STATS SCREEN ──────────────────────────────────────────────────
function showStats() {
  const total = answerTimes.length;
  if (!total) return;

  // Top cards
  const accuracy = Math.round((correctCount / total) * 100);
  const bestTime  = Math.min(...answerTimes).toFixed(1);
  const worstTime = Math.max(...answerTimes).toFixed(1);

  $('#st-accuracy').textContent  = `${accuracy}%`;
  $('#st-best-time').textContent = `${bestTime}s`;
  $('#st-worst-time').textContent= `${worstTime}s`;
  $('#st-combo-peak').textContent= `×${peakMultiplier}`;

  // Timeline pills
  const timeline = $('#answers-timeline');
  timeline.innerHTML = '';
  answerResults.forEach((res, i) => {
    const t = answerTimes[i];
    const pip = document.createElement('div');
    pip.className = 'ans-pip';
    pip.innerHTML = `
      <div class="ans-pip-dot ${res}">${res === 'correct' ? '✓' : res === 'wrong' ? '✗' : '⏱'}</div>
      <span class="ans-pip-time">${t ? t.toFixed(1)+'s' : '-'}</span>
    `;
    timeline.appendChild(pip);
  });

  // Bar chart canvas
  drawStatsChart();
  showScreen('stats');
}

function drawStatsChart() {
  const canvas = document.getElementById('stats-chart');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 460;
  const H = 120;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const n = answerTimes.length;
  if (!n) return;

  const padL = 28, padR = 10, padT = 10, padB = 24;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxT = TIMER_MAX;

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  [0.25, 0.5, 0.75, 1].forEach(frac => {
    const y = padT + chartH * (1 - frac);
    ctx.beginPath();
    ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = `${9 * dpr / dpr}px DM Sans`;
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(frac * maxT)}s`, padL - 4, y + 3);
  });

  const barW = Math.min((chartW / n) * 0.65, 28);
  const gap  = chartW / n;

  answerTimes.forEach((t, i) => {
    const res = answerResults[i];
    const frac = Math.min(t / maxT, 1);
    const barH = frac * chartH;
    const x = padL + i * gap + (gap - barW) / 2;
    const y = padT + chartH - barH;

    // Bar color by result
    const color = res === 'correct'
      ? 'rgba(61,214,140,0.75)'
      : res === 'wrong'
        ? 'rgba(241,80,74,0.7)'
        : 'rgba(100,100,120,0.5)';

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur  = 6;

    const radius = 4;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + barW - radius, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
    ctx.lineTo(x + barW, y + barH);
    ctx.lineTo(x, y + barH);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    ctx.shadowBlur = 0;

    // Q number label
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = `${8}px DM Sans`;
    ctx.textAlign = 'center';
    ctx.fillText(`Q${i+1}`, padL + i * gap + gap / 2, H - padB + 12);
  });
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
btn5050.onclick      = use5050;
btnFreeze.onclick    = useFreeze;
statsBtn.onclick     = showStats;
statsBackBtn.onclick = () => showScreen('result');

// ── INIT ─────────────────────────────────────────────────────────
renderLeaderboard();
showScreen('start');
