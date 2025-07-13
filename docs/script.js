document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const startScreen = document.getElementById('start-screen');
    const questionScreen = document.getElementById('question-screen');
    const answerScreen = document.getElementById('answer-screen');
    const resultScreen = document.getElementById('result-screen');

    const startButton = document.getElementById('start-button');
    const autoNextCheckbox = document.getElementById('auto-next-checkbox');
    const questionText = document = document.getElementById('question-text');
    const incorrectArea = document.getElementById('incorrect-area');
    const correctArea = document.getElementById('correct-area');
    const answerResult = document.getElementById('answer-result');
    const correctAnswerText = document.getElementById('correct-answer-text');
    const nextButton = document.getElementById('next-button');
    
    const totalTimeSpan = document.getElementById('total-time');
    const correctCountSpan = document.getElementById('correct-count');
    const totalQuestionsSpan = document.getElementById('total-questions');
    const endButton = document.getElementById('end-button');
    const reviewButton = document.getElementById('review-button');
    const hardModeButton = document.getElementById('hard-mode-button');

    // グローバル変数
    let allQuestions = [];
    let currentQuestions = [];
    let questionIndex = 0;
    let correctCount = 0;
    let startTime = 0;
    let totalTime = 0;
    let questionStartTime = 0;
    let isReviewMode = false;
    let isHardMode = false;
    let incorrectQuestions = [];
    let questionTimes = [];
    let autoNext = true;

    // 画面切り替え関数
    function showScreen(screen) {
        const screens = [startScreen, questionScreen, answerScreen, resultScreen];
        screens.forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    // 問題の生成とシャッフル
    function generateQuestions() {
        allQuestions = [];
        for (let a = 1; a <= 10; a++) {
            for (let b = 1; b <= a; b++) {
                allQuestions.push({
                    a: a,
                    b: b,
                    correct: a - b,
                    isCorrect: false,
                    timeTaken: 0,
                });
            }
        }
        shuffleArray(allQuestions);
        currentQuestions = [...allQuestions];
    }

    // 配列をシャッフルするフィッシャー・イェーツ法
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 問題の表示
    function showQuestion() {
        if (questionIndex >= currentQuestions.length) {
            showResultScreen();
            return;
        }
        
        const question = currentQuestions[questionIndex];
        questionText.textContent = `${question.a} - ${question.b}`;
        
        questionStartTime = performance.now();

        showScreen(questionScreen);
    }

    // 問題の判定
    function checkAnswer(isCorrect) {
        const question = currentQuestions[questionIndex];
        const timeTaken = (performance.now() - questionStartTime) / 1000;
        
        question.isCorrect = isCorrect;
        question.timeTaken = timeTaken;
        
        if (isCorrect) {
            correctCount++;
        } else {
            incorrectQuestions.push(question);
        }
        
        // 結果画面の表示
        if (isCorrect) {
            answerResult.textContent = '⭕️せいかい';
            answerResult.classList.remove('incorrect-text');
            answerResult.classList.add('correct-text');
        } else {
            answerResult.textContent = '✖️まちがい';
            answerResult.classList.remove('correct-text');
            answerResult.classList.add('incorrect-text');
        }
        correctAnswerText.textContent = `${question.correct}`;

        questionIndex++;
        showScreen(answerScreen);

        if (autoNext) {
            nextButton.classList.add('hidden');
            setTimeout(showQuestion, 700);
        } else {
            nextButton.classList.remove('hidden');
        }
    }

    // 成績画面の表示
    function showResultScreen() {
        const endTime = performance.now();
        if (!isReviewMode && !isHardMode) {
            totalTime = (endTime - startTime) / 1000;
        }

        totalTimeSpan.textContent = totalTime.toFixed(2);
        correctCountSpan.textContent = correctCount;
        
        if (isReviewMode || isHardMode) {
            totalQuestionsSpan.textContent = currentQuestions.length;
        } else {
            totalQuestionsSpan.textContent = allQuestions.length;
        }

        reviewButton.classList.add('hidden');
        hardModeButton.classList.add('hidden');

        if (incorrectQuestions.length > 0) {
            reviewButton.classList.remove('hidden');
        }
        
        const longTimeQuestions = allQuestions
            .filter(q => q.timeTaken > 0)
            .sort((a, b) => b.timeTaken - a.timeTaken)
            .slice(0, 5);
        
        if (longTimeQuestions.length > 0) {
            hardModeButton.classList.remove('hidden');
        }

        showScreen(resultScreen);
    }

    // ゲームのリセットと開始
    function resetGame(mode) {
        questionIndex = 0;
        correctCount = 0;
        
        if (mode === 'review') {
            currentQuestions = [...incorrectQuestions];
            incorrectQuestions = []; // 復習モード開始時に不正解リストをリセット
            shuffleArray(currentQuestions);
            isReviewMode = true;
            isHardMode = false;
        } else if (mode === 'hard') {
            const longTimeQuestions = allQuestions
                .filter(q => q.timeTaken > 0)
                .sort((a, b) => b.timeTaken - a.timeTaken)
                .slice(0, 5);
            currentQuestions = longTimeQuestions.length > 0 ? longTimeQuestions : allQuestions;
            shuffleArray(currentQuestions);
            isReviewMode = false;
            isHardMode = true;
        } else {
            generateQuestions();
            totalTime = 0;
            isReviewMode = false;
            isHardMode = false;
            incorrectQuestions = [];
            startTime = performance.now();
        }
        
        showQuestion();
    }

    // イベントリスナー
    startButton.addEventListener('click', () => {
        autoNext = autoNextCheckbox.checked;
        resetGame('normal');
    });

    nextButton.addEventListener('click', () => {
        showQuestion();
    });

    // 画面の右半分（正解）、左半分（不正解）で判定
    correctArea.addEventListener('click', () => checkAnswer(true));
    incorrectArea.addEventListener('click', () => checkAnswer(false));
    
    // PWAのための各ボタンのイベント
    endButton.addEventListener('click', () => {
        showScreen(startScreen);
    });

    reviewButton.addEventListener('click', () => {
        resetGame('review');
    });

    hardModeButton.addEventListener('click', () => {
        resetGame('hard');
    });

    // アプリの初期化
    showScreen(startScreen);
});
