const API_URL = "https://opentdb.com/api.php?amount=10&type=multiple";

let questions = [];
let currentIndex = 0;
let score = 0;
let timeLeft = 15;
let timerInterval = null;

let used5050 = false;
let usedFreeze = false;
let isFrozen = false;

const sounds = {
    correct: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
    wrong: new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'),
    tictac: new Audio('https://assets.mixkit.co/active_storage/sfx/2011/2011-preview.mp3'),
    freeze: new Audio('https://assets.mixkit.co/active_storage/sfx/600/600-preview.mp3')
};
sounds.tictac.loop = true;

const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const timerDisplay = document.getElementById('timer');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const finalScore = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const btn5050 = document.getElementById('joker-5050');
const btnFreeze = document.getElementById('joker-freeze');

function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

async function startQuiz() {
    startScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    currentIndex = 0;
    score = 0;
    used5050 = false;
    usedFreeze = false;
    isFrozen = false;

    btn5050.disabled = false;
    btnFreeze.disabled = false;
    timerDisplay.classList.remove('timer-critical');
    timerDisplay.style.color = "";

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        questions = data.results.map(q => ({
            question: q.question,
            correct: q.correct_answer,
            answers: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5)
        }));
        showQuestion();
    } catch (err) {
        questionText.innerText = "Erreur de connexion à l'API.";
    }
}

function showQuestion() {
    clearInterval(timerInterval);
    isFrozen = false;
    sounds.tictac.pause();
    sounds.tictac.currentTime = 0;

    const q = questions[currentIndex];
    progressText.innerText = `Question ${currentIndex + 1}/${questions.length}`;
    progressFill.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
    questionText.innerText = decodeHTML(q.question);
    
    optionsContainer.innerHTML = '';
    q.answers.forEach(ans => {
        const btn = document.createElement('button');
        btn.innerText = decodeHTML(ans);
        btn.onclick = () => handleAnswer(ans, q.correct, btn);
        optionsContainer.appendChild(btn);
    });

    btn5050.disabled = used5050;
    btnFreeze.disabled = usedFreeze;
    timerDisplay.style.color = "";

    startTimer();
}

function startTimer() {
    timeLeft = 15;
    timerDisplay.innerText = `⏳ ${timeLeft}s`;

    timerInterval = setInterval(() => {
        if (!isFrozen) {
            timeLeft--;
            timerDisplay.innerText = `⏳ ${timeLeft}s`;

            if (timeLeft < 6) {
                timerDisplay.classList.add('timer-critical');
                sounds.tictac.play().catch(() => {});
            } else {
                timerDisplay.classList.remove('timer-critical');
            }

            if (timeLeft <= 0) {
                handleAnswer(null, questions[currentIndex].correct, null);
            }
        }
    }, 1000);
}

function handleAnswer(selected, correct, btn) {
    clearInterval(timerInterval);
    sounds.tictac.pause();
    isFrozen = false;

    const btns = optionsContainer.querySelectorAll('button');
    btns.forEach(b => b.disabled = true);
    btn5050.disabled = true;
    btnFreeze.disabled = true;

    if (selected === decodeHTML(correct) || selected === correct) {
        score++;
        sounds.correct.play().catch(() => {});
        if (btn) btn.classList.add('correct');
    } else {
        sounds.wrong.play().catch(() => {});
        if (btn) btn.classList.add('wrong');
        Array.from(btns).find(b => b.innerText === decodeHTML(correct))?.classList.add('correct');
        if (navigator.vibrate) navigator.vibrate(200);
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

function use5050() {
    if (used5050 || isFrozen) return;
    used5050 = true;
    btn5050.disabled = true;

    const btns = Array.from(optionsContainer.querySelectorAll('button'));
    const correctAns = decodeHTML(questions[currentIndex].correct);
    const incorrectBtns = btns.filter(b => b.innerText !== correctAns);

    incorrectBtns.sort(() => Math.random() - 0.5)
                 .slice(0, 2)
                 .forEach(b => {
                     b.style.visibility = 'hidden';
                     b.disabled = true;
                 });
}

function useFreeze() {
    if (usedFreeze) return;
    usedFreeze = true;
    isFrozen = true;
    btnFreeze.disabled = true;
    sounds.freeze.play().catch(() => {});

    timerDisplay.innerText = "❄️ GELÉ";
    timerDisplay.style.color = "#60a5fa";

    setTimeout(() => {
        if (quizScreen.classList.contains('hidden')) return;
        isFrozen = false;
        timerDisplay.style.color = "";
    }, 10000);
}

function showEnd() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    finalScore.innerText = `${score} / ${questions.length}`;
}

startBtn.onclick = startQuiz;
restartBtn.onclick = startQuiz;
btn5050.onclick = use5050;
btnFreeze.onclick = useFreeze;
