const colors = {
    "+1":"red",
    "+2":"yellow",
    "-1":"blue",
    "-2":"green",
}

document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const startScreen = document.getElementById('start-screen');
    const questionScreen = document.getElementById('question-screen');
    const answerScreen = document.getElementById('answer-screen');
    const resultScreen = document.getElementById('result-screen');

    const menu = document.getElementById('menu');

    //const startButton = document.getElementById('start-button');
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

    const startButtons = document.querySelectorAll('.start-button');

    // グローバル変数
    let calcType = 0;
    let calcBaseType = 0;
    let calcMin = 0;
    let calcMax = 0;
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


    startButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // クリックされたボタンのdata-type属性の値を取得
            calcBaseType = event.currentTarget.dataset.type;
            document.documentElement.style.setProperty('--calc-color', colors[calcBaseType]);
            calcType = calcBaseType.split("")[0];
            calcMin =  parseInt(event.currentTarget.dataset.calcMin);
            calcMax =  parseInt(event.currentTarget.dataset.calcMax);
            autoNext = autoNextCheckbox.checked;
            resetGame('normal');
        });
    });



    function getMinuteRubyReading(minutes) {
        // 数字の末尾を判断基準にするため、絶対値を取り、文字列に変換
        const lastDigit = Math.abs(minutes) % 10;
        const lastTwoDigits = Math.abs(minutes) % 100; // 10分の場合に対応

        // 特殊な読み方をする数字
        switch (lastDigit) {
            case 1: // 1分 (いっぷん)
            case 3: // 3分 (さんぷん)
            case 4: // 4分 (よんぷん)
            case 6: // 6分 (ろっぷん)
            case 8: // 8分 (はっぷん)
            case 0: // 10分、20分などの「0」で終わる場合（「じゅっぷん」「～っぷん」）
                // ただし、70分は「ななじゅっぷん」または「ななじゅうふん」で「ふん」も使われるため、ここでは「ぷん」を優先。
                // 0分は「れいふん」なので特別扱い
                if (minutes === 0) {
                    return 'ふん'; // 0分は「れいふん」
                }
                // 10分も「じゅっぷん」
                if (lastTwoDigits === 10) {
                    return 'ぷん';
                }
                return 'ぷん'; // 基本的に「ぷん」
            case 2: // 2分 (にふん)
            case 5: // 5分 (ごふん)
            case 7: // 7分 (ななふん)
            case 9: // 9分 (きゅうふん)
                return 'ふん';
            default:
                return 'ふん'; // その他の予期せぬ場合
        }
    }





    // 画面切り替え関数
    function showScreen(screen) {
        const screens = [startScreen, questionScreen, answerScreen, resultScreen];
        screens.forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }


    function generateSubtractionProblemsWithBorrow() {
      for (let minuend = 11; minuend <= 18; minuend++) {
        for (let subtrahend = 1; subtrahend <= 9; subtrahend++) {
          if ((minuend % 10) < subtrahend) {
            allQuestions.push({
                a: minuend,
                b: subtrahend,
                correct:  minuend - subtrahend,
                isCorrect: false,
                timeTaken: 0,
            });
          }
        }
      }
      console.log(allQuestions)
      shuffleArray(allQuestions);
      currentQuestions = [...allQuestions];
    }


    function generateAdditionProblemsWithCarry() {
      const problems = [];
      for (let num1 = 2; num1 <= 9; num1++) {
        for (let num2 = 2; num2 <= 9; num2++) {
          if (num1 + num2 >= 10) {
            allQuestions.push({
                a: num1,
                b: num2,
                correct:  num1 + num2,
                isCorrect: false,
                timeTaken: 0,
            });
          }
        }
      }
      console.log(allQuestions)
      shuffleArray(allQuestions);
      currentQuestions = [...allQuestions];
    }

    // 問題の生成とシャッフル
    function generateQuestions() {
        allQuestions = [];
        //繰り下がり2桁引き算
        if (calcBaseType == "-2"){
            generateSubtractionProblemsWithBorrow();
            return
        }
        if (calcBaseType == "+2"){
            generateAdditionProblemsWithCarry();
            return
        }
        for (let a = calcMin; a <= calcMax; a++) {
            let bMax = calcMax; // デフォルトでは b は calcMax まで
            if (calcType === "-") {
                bMax = a; 
            }
            for (let b = calcMin; b <= bMax; b++) {
                let answer;
                let skipQuestion = false;
                if (calcType === "+") {
                    answer = a + b;
                    if (answer > calcMax) {
                        skipQuestion = true;
                    }
                } else {
                    answer = a - b;
                    if (answer < calcMin) {
                        skipQuestion = true;
                    }
                }
                if (!skipQuestion) {
                    allQuestions.push({
                        a: a,
                        b: b,
                        correct: answer,
                        isCorrect: false,
                        timeTaken: 0,
                    });
                }
            }
        }
        //console.log(allQuestions)
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
        questionText.textContent = `${question.a} ${calcType} ${question.b}`;
        
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

        if (totalTime < 60) {
            totalTimeSpan.innerHTML = `${totalTime.toFixed(2)}<ruby><rb>秒</rb><rt>びょう</rt></ruby>`;
        }else{
            const minutes = Math.floor(totalTime / 60);
            const seconds = totalTime % 60;
            const formattedSeconds = seconds.toFixed(2);
            const ruby = getMinuteRubyReading(minutes);
            totalTimeSpan.innerHTML = `${minutes}<ruby><rb>分</rb><rt>${ruby}</rt></ruby>${formattedSeconds}<ruby><rb>秒</rb><rt>びょう</rt></ruby>`;
        }

        
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
        console.log("start")
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
    /*
    startButton.addEventListener('click', () => {
        autoNext = autoNextCheckbox.checked;
        resetGame('normal');
    });
    */

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
