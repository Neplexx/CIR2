/* ================================================================
   TRIVIA MASTER — script.js
   + Système XP / Niveaux / Badges (localStorage)
   + Mode Contre la montre (chrono)
   ================================================================ */

// ── CONFIG ───────────────────────────────────────────────────────
const BASE_API    = "https://opentdb.com/api.php?amount=10&type=multiple";
const TIMER_MAX   = 15;
const CHRONO_MAX  = 90;          // secondes pour le mode chrono
const CIRCUMFERENCE = 2 * Math.PI * 26;

// ── XP / LEVEL SYSTEM ────────────────────────────────────────────
const LEVELS = [
  { name: 'NOVICE',     icon: '🌱', xpNeeded: 0    },
  { name: 'APPRENTI',   icon: '📚', xpNeeded: 500  },
  { name: 'ÉRUDIT',     icon: '🔍', xpNeeded: 1200 },
  { name: 'EXPERT',     icon: '⚡', xpNeeded: 2500 },
  { name: 'MAÎTRE',     icon: '🎯', xpNeeded: 4500 },
  { name: 'GRAND MAÎTRE',icon:'🏆', xpNeeded: 7500 },
  { name: 'CHAMPION',   icon: '👑', xpNeeded: 12000},
  { name: 'LÉGENDE',    icon: '💎', xpNeeded: 20000},
];

const BADGES = [
  { id: 'first_game',    icon: '🎮', name: 'PREMIER PAS',    desc: 'Terminer sa 1ère partie',         check: p => p.gamesPlayed >= 1 },
  { id: 'perfect',       icon: '💯', name: 'PARFAIT',        desc: '10/10 en mode classique',          check: p => p.perfectGames >= 1 },
  { id: 'streak5',       icon: '🔥', name: 'EN FEU',         desc: 'Streak de 5 consécutifs',          check: p => p.bestEverStreak >= 5 },
  { id: 'streak10',      icon: '🌋', name: 'INFERNAL',       desc: 'Streak de 10 consécutifs',         check: p => p.bestEverStreak >= 10 },
  { id: 'speed',         icon: '⚡', name: 'ÉCLAIR',         desc: 'Répondre en moins de 2s',          check: p => p.fastAnswers >= 1 },
  { id: 'speed10',       icon: '🚀', name: 'SUPERSONIQUE',   desc: '10 réponses rapides (<2s)',         check: p => p.fastAnswers >= 10 },
  { id: 'survivor',      icon: '🛡️', name: 'SURVIVANT',      desc: 'Finir le mode Survie',             check: p => p.survivalWins >= 1 },
  { id: 'chrono_master', icon: '⏱️', name: 'CHRONO MAÎTRE',  desc: 'Scorer 3000+ en chrono',           check: p => p.bestChronoScore >= 3000 },
  { id: 'games10',       icon: '🎖️', name: 'VÉTÉRAN',        desc: 'Jouer 10 parties',                 check: p => p.gamesPlayed >= 10 },
  { id: 'xp5000',        icon: '✨', name: 'XP FARM',        desc: 'Accumuler 5000 XP',                check: p => p.totalXP >= 5000 },
  { id: 'combo',         icon: '🎰', name: 'COMBO KING',     desc: 'Atteindre le multiplicateur ×3',   check: p => p.reachedX3 >= 1 },
  { id: 'legend',        icon: '💎', name: 'LÉGENDAIRE',     desc: 'Atteindre le niveau Légende',      check: p => p.totalXP >= 20000 },
];

// ── PROFILE (localStorage) ────────────────────────────────────────
function getProfile() {
  try {
    return JSON.parse(localStorage.getItem('trivia_profile') || 'null') || {
      totalXP: 0, gamesPlayed: 0, perfectGames: 0,
      bestEverStreak: 0, fastAnswers: 0, survivalWins: 0,
      bestChronoScore: 0, reachedX3: 0,
      unlockedBadges: [],
    };
  } catch { return { totalXP:0,gamesPlayed:0,perfectGames:0,bestEverStreak:0,fastAnswers:0,survivalWins:0,bestChronoScore:0,reachedX3:0,unlockedBadges:[] }; }
}

function saveProfile(p) {
  localStorage.setItem('trivia_profile', JSON.stringify(p));
}

function getLevelInfo(totalXP) {
  let lvlIdx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpNeeded) { lvlIdx = i; break; }
  }
  const cur  = LEVELS[lvlIdx];
  const next = LEVELS[lvlIdx + 1] || null;
  const xpInLevel  = totalXP - cur.xpNeeded;
  const xpForNext  = next ? next.xpNeeded - cur.xpNeeded : 1;
  const pct        = next ? Math.min(xpInLevel / xpForNext, 1) : 1;
  return { lvlIdx, cur, next, xpInLevel, xpForNext, pct };
}

function calcXPGain(correctCount, total, bestStreak, isChronoMode, chronoScore = 0) {
  if (isChronoMode) return Math.floor(chronoScore / 5);
  const base      = correctCount * 50;
  const streakBonus = bestStreak >= 5 ? bestStreak * 15 : 0;
  const perfectBonus = correctCount === total ? 200 : 0;
  return base + streakBonus + perfectBonus;
}

// ── STATE ─────────────────────────────────────────────────────────
let questions = [], currentIndex = 0;
let points = 0, correctCount = 0;
let streak = 0, bestStreak = 0, peakMultiplier = 1, multiplier = 1;
let used5050 = false, usedFreeze = false, isFrozen = false;
let timeLeft = TIMER_MAX;
let timerInterval = null;
let lives = 3;
let gameMode = 'classic';
let answerTimes = [], answerResults = [];
let questionStart = 0;
let currentCategory = '';
let fastAnswerCount = 0;

// Chrono state
let chronoTimeLeft = CHRONO_MAX;
let chronoInterval = null;
let chronoScore    = 0;
let chronoCorrect  = 0;
let chronoTotal    = 0;
let chronoStreak   = 0;
let chronoBestStreak = 0;
let chronoMult     = 1;
let chronoPool     = [];   // all fetched questions
let chronoIdx      = 0;

// ── DOM ───────────────────────────────────────────────────────────
const screens      = {
  start:  q('#start-screen'),
  quiz:   q('#quiz-screen'),
  chrono: q('#chrono-screen'),
  result: q('#result-screen'),
  stats:  q('#stats-screen'),
};

const progressFill  = q('#progress-fill');
const progressText  = q('#progress-text');
const timerNum      = q('#timer-num');
const timerRingFg   = q('#timer-ring-fg');
const questionCard  = q('#question-card');
const questionText  = q('#question-text');
const questionCat   = q('#question-category');
const optsCont      = q('#options-container');
const liveScore     = q('#live-score');
const streakCount   = q('#streak-count');
const streakDisplay = q('#streak-display');
const multiBadge    = q('#multiplier-badge');
const livesBar      = q('#lives-bar');
const startBtn      = q('#start-btn');
const restartBtn    = q('#restart-btn');
const btn5050       = q('#joker-5050');
const btnFreeze     = q('#joker-freeze');
const finalScoreNum = q('#final-score-num');
const finalScoreDen = q('#final-score-denom');
const recordMsg     = q('#record-msg');
const statStreak    = q('#stat-streak');
const statPoints    = q('#stat-points');
const statTime      = q('#stat-time');
const donutFg       = q('#donut-fg');
const resultEmoji   = q('#result-emoji');
const playerName    = q('#player-name');
const saveScoreBtn  = q('#save-score-btn');
const lbList        = q('#leaderboard-list');
const statsBtn      = q('#stats-btn');
const statsBackBtn  = q('#stats-back-btn');

// Profile DOM
const profileAvatar    = q('#profile-avatar');
const profileLevelName = q('#profile-level-name');
const profileXpFill    = q('#profile-xp-fill');
const profileXpLabel   = q('#profile-xp-label');
const openBadgesBtn    = q('#open-badges-btn');
const closeBadgesBtn   = q('#close-badges-btn');
const badgesModal      = q('#badges-modal');
const badgesGrid       = q('#badges-grid');

// Chrono DOM
const chronoScoreEl   = q('#chrono-score');
const chronoStreakEl  = q('#chrono-streak');
const chronoCountEl   = q('#chrono-count');
const chronoTimeEl    = q('#chrono-time-num');
const chronoBarFill   = q('#chrono-bar-fill');
const chronoMultEl    = q('#chrono-multiplier');
const chronoFeedback  = q('#chrono-feedback');
const chronoQCat      = q('#chrono-question-cat');
const chronoQText     = q('#chrono-question-text');
const chronoOptsCont  = q('#chrono-options');

function q(sel) { return document.querySelector(sel); }

// ── AUDIO ENGINE ─────────────────────────────────────────────────
let audioCtx;
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 4;
    comp.attack.value = 0.003;  comp.release.value = 0.15;
    comp.connect(audioCtx.destination);
    audioCtx._master = comp;
  }
  return audioCtx;
}
function getOut() { return getAudioCtx()._master; }

function tone(freq, type, start, dur, vol = 0.22, pitchEnd = null) {
  try {
    const ctx = getAudioCtx(), osc = ctx.createOscillator(), g = ctx.createGain();
    osc.connect(g); g.connect(getOut());
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    if (pitchEnd !== null) osc.frequency.linearRampToValueAtTime(pitchEnd, ctx.currentTime + start + dur);
    g.gain.setValueAtTime(0, ctx.currentTime + start);
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur + 0.05);
  } catch(e) {}
}
function noise(dur, vol = 0.07) {
  try {
    const ctx = getAudioCtx(), buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain(), f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 0.5;
    src.connect(f); f.connect(g); g.connect(getOut());
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.start(); src.stop(ctx.currentTime + dur + 0.05);
  } catch(e) {}
}

function playCorrect(s = 0) {
  const base = 440 + Math.min(s, 6) * 40, third = base * 1.26, fifth = base * 1.498;
  if (s >= 7) { tone(base,'sine',0,0.3,0.2); tone(third,'sine',0.02,0.3,0.18); tone(fifth,'sine',0.04,0.3,0.16); tone(base*2,'sine',0.1,0.25,0.12); noise(0.06,0.06); }
  else if (s >= 5) { tone(base,'sine',0,0.18,0.22); tone(third,'sine',0.07,0.18,0.2); tone(fifth,'sine',0.14,0.22,0.18); }
  else if (s >= 3) { tone(base,'sine',0,0.16,0.22); tone(fifth,'sine',0.09,0.2,0.18); }
  else { tone(520,'sine',0,0.13,0.2); tone(780,'sine',0.08,0.17,0.18); }
}
function playWrong()    { tone(220,'sawtooth',0,0.14,0.17,180); tone(160,'square',0.07,0.18,0.11); noise(0.1,0.06); }
function playTick(t=5)  { tone(t<=2?1200:t<=4?1000:880,'square',0,0.05,t<=2?0.12:0.07); }
function playComboUp(l) { const seq={3:[400,600],5:[500,750,1000],7:[600,900,1200,1500]}[l]||[500,800]; seq.forEach((f,i)=>tone(f,'sine',i*0.07,0.12,0.18)); }
function playFreeze()   { [1800,1400,1100,900,700].forEach((f,i)=>tone(f,'sine',i*0.055,0.1,0.1)); }
function playSpeedBonus(){ tone(1047,'sine',0,0.1,0.15); tone(1319,'sine',0.06,0.1,0.15); tone(1568,'sine',0.12,0.13,0.12); }
function playGameOver() { tone(300,'sawtooth',0,0.3,0.2,180); tone(240,'sawtooth',0.25,0.4,0.17,120); tone(120,'square',0.55,0.5,0.14); noise(0.4,0.07); }
function playLevelUp()  { [523,659,784,1047,1319].forEach((f,i)=>tone(f,'sine',i*0.09,0.28,0.16)); }
function playResultFanfare(pct) {
  if (pct>=0.9)       { [523,659,784,1047].forEach((f,i)=>tone(f,'sine',i*0.1,0.32,0.14)); }
  else if (pct>=0.5)  { tone(440,'sine',0,0.2,0.14); tone(554,'sine',0.15,0.2,0.11); }
  else                { tone(330,'triangle',0,0.3,0.11,280); }
}

// ── BACKGROUND CANVAS ────────────────────────────────────────────
(function() {
  const cv = document.getElementById('bg-canvas'), ctx = cv.getContext('2d');
  const pts = [];
  function resize() { cv.width = innerWidth; cv.height = innerHeight; }
  resize(); window.addEventListener('resize', resize);
  for (let i=0;i<55;i++) pts.push({ x:Math.random()*innerWidth, y:Math.random()*innerHeight, r:Math.random()*1.3+0.3, dx:(Math.random()-.5)*.17, dy:(Math.random()-.5)*.17, a:Math.random()*.38+.05 });
  (function draw() {
    ctx.clearRect(0,0,cv.width,cv.height);
    pts.forEach(p => { ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=`rgba(212,168,83,${p.a})`; ctx.fill(); p.x+=p.dx; p.y+=p.dy; if(p.x<0)p.x=innerWidth; if(p.x>innerWidth)p.x=0; if(p.y<0)p.y=innerHeight; if(p.y>innerHeight)p.y=0; });
    requestAnimationFrame(draw);
  })();
})();

// ── PARTICLE BURST ────────────────────────────────────────────────
(function() {
  const cv = document.getElementById('particle-canvas'), ctx = cv.getContext('2d');
  let sparks = [];
  function resize() { cv.width = innerWidth; cv.height = innerHeight; }
  resize(); window.addEventListener('resize', resize);
  window.burstParticles = (x, y, color) => {
    for (let i=0;i<28;i++) { const a=Math.random()*Math.PI*2, sp=Math.random()*5+2; sparks.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,alpha:1,r:Math.random()*3+1.5,color,decay:Math.random()*.022+.018}); }
  };
  (function loop() {
    ctx.clearRect(0,0,cv.width,cv.height);
    sparks = sparks.filter(s=>s.alpha>.01);
    sparks.forEach(s => { s.x+=s.vx; s.y+=s.vy; s.vy+=.12; s.alpha-=s.decay; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle=s.color.replace('1)',`${s.alpha})`); ctx.fill(); });
    requestAnimationFrame(loop);
  })();
})();

// ── SCREEN TRANSITIONS ────────────────────────────────────────────
function showScreen(name) {
  Object.entries(screens).forEach(([k,el]) => {
    if (k === name) { el.classList.remove('exit'); el.classList.add('active'); }
    else if (el.classList.contains('active')) { el.classList.add('exit'); el.classList.remove('active'); setTimeout(()=>el.classList.remove('exit'),500); }
  });
}

// ── PROFILE UI ───────────────────────────────────────────────────
function renderProfile() {
  const p  = getProfile();
  const li = getLevelInfo(p.totalXP);
  profileAvatar.textContent    = li.cur.icon;
  profileLevelName.textContent = li.cur.name;
  profileXpFill.style.width    = `${li.pct * 100}%`;
  profileXpLabel.textContent   = li.next
    ? `${li.xpInLevel} / ${li.xpForNext} XP`
    : `${p.totalXP} XP — MAX`;
}

function renderBadgesModal() {
  const p = getProfile();
  badgesGrid.innerHTML = '';
  BADGES.forEach(b => {
    const unlocked = p.unlockedBadges.includes(b.id);
    const div = document.createElement('div');
    div.className = 'badge-item ' + (unlocked ? 'unlocked' : 'locked');
    div.innerHTML = `<span class="badge-icon">${b.icon}</span><span class="badge-name">${b.name}</span><span class="badge-desc">${b.desc}</span>`;
    badgesGrid.appendChild(div);
  });
}

openBadgesBtn.onclick = () => { renderBadgesModal(); badgesModal.classList.remove('hidden'); };
closeBadgesBtn.onclick = () => badgesModal.classList.add('hidden');
badgesModal.addEventListener('click', e => { if (e.target === badgesModal) badgesModal.classList.add('hidden'); });

// ── XP AWARD ─────────────────────────────────────────────────────
function awardXP(gameData) {
  const p = getProfile();
  const { correct, total, bStreak, mode, fAnswers, isSurvivalWin, chronoPts, isPerfect, hitX3 } = gameData;

  const xpGained = calcXPGain(correct, total, bStreak, mode === 'chrono', chronoPts);

  const oldXP     = p.totalXP;
  const oldLvlIdx = getLevelInfo(oldXP).lvlIdx;

  // Update stats
  p.totalXP       += xpGained;
  p.gamesPlayed   += 1;
  if (isPerfect)      p.perfectGames  += 1;
  if (bStreak > p.bestEverStreak) p.bestEverStreak = bStreak;
  p.fastAnswers   += fAnswers;
  if (isSurvivalWin)  p.survivalWins  += 1;
  if (mode === 'chrono' && chronoPts > p.bestChronoScore) p.bestChronoScore = chronoPts;
  if (hitX3) p.reachedX3 += 1;

  // Check new badges
  const newBadges = [];
  BADGES.forEach(b => {
    if (!p.unlockedBadges.includes(b.id) && b.check(p)) {
      p.unlockedBadges.push(b.id);
      newBadges.push(b);
    }
  });

  const newLvlIdx  = getLevelInfo(p.totalXP).lvlIdx;
  const leveledUp  = newLvlIdx > oldLvlIdx;

  saveProfile(p);
  renderProfile();

  return { xpGained, leveledUp, newLevelName: LEVELS[newLvlIdx].name, newBadges };
}

// ── XP RESULT UI ─────────────────────────────────────────────────
function animateXPBlock(xpGained, leveledUp, newLevelName, newBadges) {
  const p  = getProfile();
  const li = getLevelInfo(p.totalXP);

  q('#xp-gain-amount').textContent = `+${xpGained} XP`;
  q('#xp-bar-level-name').textContent = li.cur.name;
  q('#xp-bar-progress').textContent = li.next
    ? `${li.xpInLevel} / ${li.xpForNext} XP`
    : `MAX`;

  // Animate bar from old position to new
  const beforePct = Math.max(0, li.pct - (xpGained / (li.xpForNext || 1)));
  const afterPct  = li.pct;
  const before = q('#xp-bar-before');
  const fill   = q('#xp-bar-result-fill');
  before.style.width = `${Math.min(beforePct,1)*100}%`;
  fill.style.width   = '0%';
  setTimeout(() => { fill.style.width = `${Math.min(afterPct,1)*100}%`; }, 200);

  if (leveledUp) {
    const banner = q('#levelup-banner');
    q('#levelup-text').textContent = `NIVEAU SUPÉRIEUR — ${newLevelName} !`;
    banner.classList.remove('hidden');
    playLevelUp();
    setTimeout(() => {
      for (let i=0;i<4;i++) setTimeout(()=>burstParticles(innerWidth*(.2+Math.random()*.6),innerHeight*(.2+Math.random()*.4),'rgba(129,140,248,'),i*200);
    },400);
  } else {
    q('#levelup-banner').classList.add('hidden');
  }

  const newBadgesCont = q('#new-badges');
  newBadgesCont.innerHTML = '';
  newBadges.forEach(b => {
    const pill = document.createElement('div');
    pill.className = 'new-badge-pill';
    pill.innerHTML = `${b.icon} ${b.name}`;
    newBadgesCont.appendChild(pill);
  });
}

// ── LEADERBOARD ───────────────────────────────────────────────────
function getScores() { try { return JSON.parse(localStorage.getItem('trivia_scores')||'[]'); } catch{ return []; } }
function saveScore(name, pts, total) {
  const s = getScores();
  s.push({ name: name||'Anonyme', pts, total, date: new Date().toLocaleDateString('fr-FR') });
  s.sort((a,b)=>b.pts-a.pts); s.splice(5);
  localStorage.setItem('trivia_scores', JSON.stringify(s));
  renderLeaderboard();
}
function renderLeaderboard() {
  const s = getScores();
  if (!s.length) { lbList.innerHTML='<span class="no-scores">Aucun score enregistré</span>'; return; }
  const medals=['🥇','🥈','🥉','④','⑤'];
  lbList.innerHTML = s.map((e,i)=>`<div class="lb-row"><span class="lb-rank">${medals[i]}</span><span class="lb-name">${esc(e.name)}</span><span class="lb-pts">${e.pts} pts</span><span class="lb-tag">${e.date}</span></div>`).join('');
}
function getBestScore() { const s=getScores(); return s.length?s[0].pts:0; }
function esc(str) { return str.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// ── HELPERS ───────────────────────────────────────────────────────
function decode(html) { const t=document.createElement('textarea'); t.innerHTML=html; return t.value; }
function setTimerRing(frac) { timerRingFg.style.strokeDashoffset = CIRCUMFERENCE*(1-frac); }
function updateMultiBadge() { multiBadge.textContent=`×${multiplier}`; multiBadge.classList.toggle('visible', multiplier>1); }
function popScore() { liveScore.textContent=points; liveScore.classList.add('pop'); setTimeout(()=>liveScore.classList.remove('pop'),220); }
function renderLives() {
  if (gameMode!=='survival') { livesBar.innerHTML=''; return; }
  livesBar.innerHTML='';
  for (let i=0;i<3;i++) { const d=document.createElement('div'); d.className='life-pip'+(i>=lives?' lost':''); livesBar.appendChild(d); }
}
function sleep(ms) { return new Promise(r=>setTimeout(r,ms)); }

// ── START QUIZ (classic / survival) ──────────────────────────────
async function startQuiz() {
  currentIndex=0; points=0; correctCount=0; streak=0; bestStreak=0;
  multiplier=1; peakMultiplier=1; used5050=false; usedFreeze=false; isFrozen=false;
  answerTimes=[]; answerResults=[]; fastAnswerCount=0;
  gameMode = q('#game-mode').value;

  if (gameMode === 'chrono') { startChronoMode(); return; }

  lives=3;
  btn5050.disabled=false; btnFreeze.disabled=false;
  liveScore.textContent='0'; streakCount.textContent='0';
  streakDisplay.classList.remove('active');
  updateMultiBadge(); renderLives();
  showScreen('quiz');

  const diff=q('#difficulty').value, cat=q('#category').value;
  currentCategory = q('#category').options[q('#category').selectedIndex].text;

  try {
    const res  = await fetch(`${BASE_API}&difficulty=${diff}&category=${cat}`);
    const data = await res.json();
    questions  = data.results.map(d=>({ question:d.question, correct:d.correct_answer, answers:[...d.incorrect_answers,d.correct_answer].sort(()=>Math.random()-.5) }));
    showQuestion();
  } catch { questionText.textContent = '❌ Erreur API. Vérifie ta connexion.'; }
}

// ── SHOW QUESTION ─────────────────────────────────────────────────
async function showQuestion() {
  clearInterval(timerInterval); isFrozen=false;
  const qObj = questions[currentIndex];

  questionCard.classList.add('slide-out');
  await sleep(180);
  questionCard.classList.remove('slide-out');

  progressText.textContent = `${currentIndex+1} / ${questions.length}`;
  progressFill.style.width = `${((currentIndex+1)/questions.length)*100}%`;
  questionCat.textContent  = currentCategory.toUpperCase();
  questionText.textContent = decode(qObj.question);

  questionCard.classList.add('slide-in');
  setTimeout(()=>questionCard.classList.remove('slide-in'),380);

  optsCont.innerHTML='';
  qObj.answers.forEach(ans => {
    const btn=document.createElement('button');
    btn.className='option-btn'; btn.textContent=decode(ans);
    btn.onclick=()=>handleAnswer(ans,qObj.correct,btn);
    optsCont.appendChild(btn);
  });

  btn5050.disabled=used5050; btnFreeze.disabled=usedFreeze;
  questionStart=Date.now();
  startTimer();
}

// ── TIMER ─────────────────────────────────────────────────────────
function startTimer() {
  timeLeft=TIMER_MAX; setTimerRing(1);
  timerNum.textContent=timeLeft;
  timerNum.classList.remove('critical'); timerRingFg.classList.remove('critical');
  timerInterval = setInterval(()=>{
    if (isFrozen) return;
    timeLeft--;
    timerNum.textContent=timeLeft;
    setTimerRing(timeLeft/TIMER_MAX);
    if (timeLeft<=5) { timerNum.classList.add('critical'); timerRingFg.classList.add('critical'); playTick(timeLeft); }
    if (timeLeft<=0) handleAnswer(null,questions[currentIndex].correct,null);
  },1000);
}

// ── HANDLE ANSWER (classic/survival) ─────────────────────────────
function handleAnswer(selected, correct, btn) {
  clearInterval(timerInterval);
  timerNum.classList.remove('critical'); timerRingFg.classList.remove('critical');
  isFrozen=false;

  const elapsed = (Date.now()-questionStart)/1000;
  answerTimes.push(Math.min(elapsed,TIMER_MAX));

  const allBtns=optsCont.querySelectorAll('.option-btn');
  allBtns.forEach(b=>b.disabled=true);
  btn5050.disabled=true; btnFreeze.disabled=true;

  const decodedCorrect=decode(correct);
  const isCorrect=selected&&(decode(selected)===decodedCorrect||selected===correct);

  if (isCorrect) {
    const timeBonus=Math.ceil((timeLeft/TIMER_MAX)*50);
    const isSpeed=timeLeft>=TIMER_MAX-4;
    if (isSpeed) fastAnswerCount++;
    const gained=(100+timeBonus)*multiplier;
    points+=gained; correctCount++; streak++; bestStreak=Math.max(bestStreak,streak);

    const prevMult=multiplier;
    if (streak>=7) multiplier=3; else if(streak>=5) multiplier=2; else if(streak>=3) multiplier=1.5; else multiplier=1;
    if (multiplier>peakMultiplier) peakMultiplier=multiplier;

    streakCount.textContent=streak;
    if (streak>=2) streakDisplay.classList.add('active');
    updateMultiBadge(); popScore();

    if (multiplier>prevMult) { playComboUp(streak>=7?7:streak>=5?5:3); }
    else if (isSpeed)        { playSpeedBonus(); }
    else                     { playCorrect(streak); }

    answerResults.push('correct');
    if (btn) { btn.classList.add('correct'); const r=btn.getBoundingClientRect(); burstParticles(r.left+r.width/2,r.top+r.height/2,'rgba(61,214,140,'); }
  } else {
    streak=0; multiplier=1;
    streakCount.textContent=0; streakDisplay.classList.remove('active');
    updateMultiBadge();
    answerResults.push(selected===null?'timeout':'wrong');
    playWrong();
    if (btn) btn.classList.add('wrong');
    Array.from(allBtns).find(b=>b.textContent===decodedCorrect)?.classList.add('correct');
    if (navigator.vibrate) navigator.vibrate(200);
    if (gameMode==='survival') { lives--; renderLives(); if(lives<=0){playGameOver();setTimeout(showEnd,1500);return;} }
  }

  setTimeout(()=>{ if(currentIndex+1<questions.length){currentIndex++;showQuestion();}else{showEnd();} },1500);
}

// ── 50/50 ─────────────────────────────────────────────────────────
function use5050() {
  if (used5050) return; used5050=true; btn5050.disabled=true;
  const btns=Array.from(optsCont.querySelectorAll('.option-btn'));
  const correct=decode(questions[currentIndex].correct);
  btns.filter(b=>b.textContent!==correct).sort(()=>Math.random()-.5).slice(0,2).forEach(b=>{b.style.visibility='hidden';b.disabled=true;});
}

// ── FREEZE ────────────────────────────────────────────────────────
function useFreeze() {
  if (usedFreeze) return; usedFreeze=true; isFrozen=true; btnFreeze.disabled=true;
  playFreeze(); timerNum.textContent='❄'; timerRingFg.style.stroke='#60a5fa';
  setTimeout(()=>{ if(!q('#quiz-screen').classList.contains('active'))return; isFrozen=false; timerNum.textContent=timeLeft; timerRingFg.style.stroke=''; },10000);
}

// ══════════════════════════════════════════════════════════════════
//   CHRONO MODE
// ══════════════════════════════════════════════════════════════════
async function startChronoMode() {
  chronoTimeLeft=CHRONO_MAX; chronoScore=0; chronoCorrect=0; chronoTotal=0;
  chronoStreak=0; chronoBestStreak=0; chronoMult=1; chronoIdx=0;
  fastAnswerCount=0;

  chronoScoreEl.textContent='0'; chronoStreakEl.textContent='🔥0';
  chronoCountEl.textContent='0'; chronoTimeEl.textContent=CHRONO_MAX;
  chronoBarFill.style.width='100%';
  chronoBarFill.classList.remove('critical');
  chronoTimeEl.classList.remove('critical');
  chronoMultEl.classList.add('hidden');
  chronoFeedback.textContent='';

  showScreen('chrono');

  const diff=q('#difficulty').value, cat=q('#category').value;
  currentCategory = q('#category').options[q('#category').selectedIndex].text;

  // Pre-fetch a big pool (we'll cycle through)
  try {
    const res = await fetch(`${BASE_API}&difficulty=${diff}&category=${cat}&amount=10`);
    const data = await res.json();
    chronoPool = data.results.map(d=>({ question:d.question, correct:d.correct_answer, answers:[...d.incorrect_answers,d.correct_answer].sort(()=>Math.random()-.5) }));
  } catch {
    chronoQText.textContent='❌ Erreur API.'; return;
  }

  renderChronoQuestion();
  startChronoTimer();
}

function startChronoTimer() {
  clearInterval(chronoInterval);
  chronoInterval = setInterval(()=>{
    chronoTimeLeft--;
    chronoTimeEl.textContent = chronoTimeLeft;
    chronoBarFill.style.width = `${(chronoTimeLeft/CHRONO_MAX)*100}%`;

    if (chronoTimeLeft <= 20) {
      chronoBarFill.classList.add('critical');
      chronoTimeEl.classList.add('critical');
      if (chronoTimeLeft <= 10) playTick(chronoTimeLeft);
    }

    if (chronoTimeLeft <= 0) {
      clearInterval(chronoInterval);
      endChronoMode();
    }
  },1000);
}

function renderChronoQuestion() {
  if (chronoIdx >= chronoPool.length) {
    // Pool exhausted — shuffle and restart (seamless infinite loop)
    chronoPool.sort(()=>Math.random()-.5);
    chronoIdx=0;
  }
  const qObj = chronoPool[chronoIdx];
  chronoQCat.textContent  = currentCategory.toUpperCase();
  chronoQText.textContent = decode(qObj.question);

  chronoOptsCont.innerHTML='';
  qObj.answers.forEach(ans=>{
    const btn=document.createElement('button');
    btn.className='option-btn'; btn.textContent=decode(ans);
    btn.onclick=()=>handleChronoAnswer(ans, qObj.correct);
    chronoOptsCont.appendChild(btn);
  });

  chronoFeedback.textContent='';
  chronoFeedback.className='chrono-feedback';
}

function handleChronoAnswer(selected, correct) {
  const allBtns=chronoOptsCont.querySelectorAll('.option-btn');
  allBtns.forEach(b=>b.disabled=true);

  const decodedCorrect=decode(correct);
  const isCorrect = decode(selected)===decodedCorrect || selected===correct;
  chronoTotal++;

  if (isCorrect) {
    chronoCorrect++; chronoStreak++; chronoBestStreak=Math.max(chronoBestStreak,chronoStreak);

    // Multiplier: 1 → 1.5 → 2 → 3
    const prevMult=chronoMult;
    if (chronoStreak>=7) chronoMult=3; else if(chronoStreak>=5) chronoMult=2; else if(chronoStreak>=3) chronoMult=1.5; else chronoMult=1;
    if (chronoMult>peakMultiplier) peakMultiplier=chronoMult;

    const gained = Math.round(150 * chronoMult);
    chronoScore += gained;

    chronoScoreEl.textContent = chronoScore;
    chronoStreakEl.textContent = `🔥${chronoStreak}`;
    chronoCountEl.textContent  = `${chronoCorrect}/${chronoTotal}`;

    if (chronoMult>1) { chronoMultEl.textContent=`×${chronoMult}`; chronoMultEl.classList.remove('hidden'); } else { chronoMultEl.classList.add('hidden'); }

    if (chronoMult>prevMult) playComboUp(chronoStreak>=7?7:chronoStreak>=5?5:3);
    else                     playCorrect(chronoStreak);

    // Show feedback
    const fb = chronoFeedback;
    fb.textContent = `+${gained}${chronoMult>1?' (×'+chronoMult+')':''}`;
    fb.className='chrono-feedback correct-fb';

    // Flash correct
    Array.from(allBtns).find(b=>b.textContent===decodedCorrect)?.classList.add('correct');

    // Quick advance
    setTimeout(()=>{ chronoIdx++; renderChronoQuestion(); },420);
  } else {
    chronoStreak=0; chronoMult=1;
    chronoMultEl.classList.add('hidden');
    chronoStreakEl.textContent='🔥0';
    playWrong();
    if (navigator.vibrate) navigator.vibrate(180);

    const fb=chronoFeedback;
    fb.textContent='✗ RATÉ';
    fb.className='chrono-feedback wrong-fb';

    Array.from(allBtns).find(b=>b.textContent===decodedCorrect)?.classList.add('correct');

    setTimeout(()=>{ chronoIdx++; renderChronoQuestion(); },620);
  }
}

function endChronoMode() {
  // Populate result screen for chrono
  const pct = chronoCorrect / Math.max(chronoTotal, 1);
  resultEmoji.textContent = pct>=0.8?'🏆':pct>=0.5?'🎯':'😅';
  finalScoreNum.textContent = chronoScore;
  finalScoreDen.textContent = 'pts';
  statStreak.textContent    = chronoBestStreak;
  statPoints.textContent    = `${chronoScore} pts`;
  statTime.textContent      = `${chronoCorrect}/${chronoTotal}`;

  // Dummy donut showing accuracy
  const donutCirc=314;
  requestAnimationFrame(()=>{ donutFg.style.strokeDashoffset = donutCirc*(1-pct); });

  // Record check
  const prev=getBestScore();
  if (chronoScore>prev && chronoCorrect>0) {
    recordMsg.classList.remove('hidden');
    setTimeout(()=>{ for(let i=0;i<5;i++) setTimeout(()=>burstParticles(innerWidth*(.2+Math.random()*.6),innerHeight*(.2+Math.random()*.4),'rgba(212,168,83,'),i*180); },400);
  } else { recordMsg.classList.add('hidden'); }

  // Hide stats btn (no per-question data for chrono)
  statsBtn.classList.add('hidden');

  // XP
  const result = awardXP({ correct:chronoCorrect, total:chronoTotal, bStreak:chronoBestStreak, mode:'chrono', fAnswers:fastAnswerCount, isSurvivalWin:false, chronoPts:chronoScore, isPerfect:false, hitX3:peakMultiplier>=3 });
  setTimeout(()=>animateXPBlock(result.xpGained,result.leveledUp,result.newLevelName,result.newBadges),300);
  setTimeout(()=>playResultFanfare(pct),400);

  showScreen('result');
}

// ── END GAME (classic / survival) ────────────────────────────────
function showEnd() {
  clearInterval(timerInterval); isFrozen=false;
  const total=questions.length;
  const avgTime=answerTimes.length?(answerTimes.reduce((a,b)=>a+b,0)/answerTimes.length).toFixed(1):'-';

  finalScoreNum.textContent=correctCount;
  finalScoreDen.textContent=`/ ${total}`;
  statStreak.textContent=bestStreak;
  statPoints.textContent=`${points} pts`;
  statTime.textContent=`${avgTime}s`;

  const pct=correctCount/total;
  resultEmoji.textContent = pct===1?'🏆':pct>=.7?'🎯':pct>=.4?'😅':'💀';

  const donutCirc=314;
  requestAnimationFrame(()=>{ donutFg.style.strokeDashoffset=donutCirc*(1-pct); });

  const prev=getBestScore();
  if (points>prev&&correctCount>0) {
    recordMsg.classList.remove('hidden');
    setTimeout(()=>{ for(let i=0;i<5;i++) setTimeout(()=>burstParticles(innerWidth*(.2+Math.random()*.6),innerHeight*(.2+Math.random()*.4),'rgba(212,168,83,'),i*180); },500);
  } else { recordMsg.classList.add('hidden'); }

  statsBtn.classList.remove('hidden');

  // Award XP
  const isSurvivalWin = gameMode==='survival' && lives>0;
  const result = awardXP({ correct:correctCount, total, bStreak:bestStreak, mode:gameMode, fAnswers:fastAnswerCount, isSurvivalWin, chronoPts:0, isPerfect:correctCount===total, hitX3:peakMultiplier>=3 });
  setTimeout(()=>animateXPBlock(result.xpGained,result.leveledUp,result.newLevelName,result.newBadges),300);
  setTimeout(()=>playResultFanfare(pct),400);

  showScreen('result');
}

// ── STATS SCREEN ─────────────────────────────────────────────────
function showStats() {
  if (!answerTimes.length) return;
  const accuracy=Math.round((correctCount/answerTimes.length)*100);
  q('#st-accuracy').textContent  = `${accuracy}%`;
  q('#st-best-time').textContent = `${Math.min(...answerTimes).toFixed(1)}s`;
  q('#st-worst-time').textContent= `${Math.max(...answerTimes).toFixed(1)}s`;
  q('#st-combo-peak').textContent= `×${peakMultiplier}`;

  const tl=q('#answers-timeline'); tl.innerHTML='';
  answerResults.forEach((res,i)=>{
    const t=answerTimes[i], pip=document.createElement('div');
    pip.className='ans-pip';
    pip.innerHTML=`<div class="ans-pip-dot ${res}">${res==='correct'?'✓':res==='wrong'?'✗':'⏱'}</div><span class="ans-pip-time">${t?t.toFixed(1)+'s':'-'}</span>`;
    tl.appendChild(pip);
  });
  drawStatsChart();
  showScreen('stats');
}

function drawStatsChart() {
  const canvas=q('#stats-chart'), dpr=window.devicePixelRatio||1;
  const W=canvas.offsetWidth||460, H=120;
  canvas.width=W*dpr; canvas.height=H*dpr;
  canvas.style.width=W+'px'; canvas.style.height=H+'px';
  const ctx=canvas.getContext('2d'); ctx.scale(dpr,dpr); ctx.clearRect(0,0,W,H);
  const n=answerTimes.length; if(!n) return;
  const padL=28,padR=10,padT=10,padB=24, cW=W-padL-padR, cH=H-padT-padB;
  ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
  [.25,.5,.75,1].forEach(fr=>{ const y=padT+cH*(1-fr); ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(padL+cW,y); ctx.stroke(); ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.font='9px DM Sans'; ctx.textAlign='right'; ctx.fillText(`${Math.round(fr*TIMER_MAX)}s`,padL-4,y+3); });
  const barW=Math.min((cW/n)*.65,28), gap=cW/n;
  answerTimes.forEach((t,i)=>{
    const res=answerResults[i], frac=Math.min(t/TIMER_MAX,1), barH=frac*cH;
    const x=padL+i*gap+(gap-barW)/2, y=padT+cH-barH;
    const color=res==='correct'?'rgba(61,214,140,0.75)':res==='wrong'?'rgba(241,80,74,0.7)':'rgba(100,100,120,0.5)';
    ctx.shadowColor=color; ctx.shadowBlur=6;
    const r=4; ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+barW-r,y); ctx.quadraticCurveTo(x+barW,y,x+barW,y+r);
    ctx.lineTo(x+barW,y+barH); ctx.lineTo(x,y+barH); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
    ctx.fillStyle=color; ctx.fill(); ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='8px DM Sans'; ctx.textAlign='center';
    ctx.fillText(`Q${i+1}`,padL+i*gap+gap/2,H-padB+12);
  });
}

// ── EVENTS ────────────────────────────────────────────────────────
saveScoreBtn.onclick = ()=>{
  saveScore(playerName.value.trim(), gameMode==='chrono'?chronoScore:points, questions.length);
  saveScoreBtn.textContent='✓ SAUVEGARDÉ'; saveScoreBtn.disabled=true;
};
startBtn.onclick    = startQuiz;
restartBtn.onclick  = ()=>{ saveScoreBtn.textContent='SAUVEGARDER'; saveScoreBtn.disabled=false; playerName.value=''; startQuiz(); };
btn5050.onclick     = use5050;
btnFreeze.onclick   = useFreeze;
statsBtn.onclick    = showStats;
statsBackBtn.onclick= ()=>showScreen('result');

// ── INIT ─────────────────────────────────────────────────────────
renderProfile();
renderLeaderboard();
showScreen('start');
