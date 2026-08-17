const IQApp = {
    questions: [],
    currentIndex: 0,
    userAnswers: [],
    questionStartTime: 0,
    timerInterval: null,
    totalSeconds: 0,

    startTest() {
        this.questions = QuestionBank.getTestSet(10);
        this.currentIndex = 0;
        this.userAnswers = [];
        this.totalSeconds = 0;

        document.getElementById('start-card').classList.add('hidden');
        document.getElementById('result-card').classList.add('hidden');
        document.getElementById('quiz-card').classList.remove('hidden');
        document.getElementById('timer-box').classList.remove('hidden');

        this.startGlobalTimer();
        this.renderQuestion();
    },

    startGlobalTimer() {
        this.timerInterval = setInterval(() => {
            this.totalSeconds++;
            const mins = String(Math.floor(this.totalSeconds / 60)).padStart(2, '0');
            const secs = String(this.totalSeconds % 60).padStart(2, '0');
            document.getElementById('time-display').innerText = `${mins}:${secs}`;
        }, 1000);
    },

    renderQuestion() {
        const q = this.questions[this.currentIndex];
        this.questionStartTime = Date.now();

        document.getElementById('category-label').innerText = `المحور: ${q.category}`;
        document.getElementById('progress-text').innerText = `${this.currentIndex + 1} من ${this.questions.length}`;
        document.getElementById('progress-bar').style.width = `${((this.currentIndex + 1) / this.questions.length) * 100}%`;

        document.getElementById('question-text').innerText = q.text;

        const visualBox = document.getElementById('visual-matrix-container');
        if (q.isVisual) {
            visualBox.classList.remove('hidden');
            visualBox.innerHTML = `
                <svg width="200" height="100" class="border border-indigo-500/50 rounded-lg bg-slate-950">
                    <circle cx="50" cy="50" r="20" fill="#6366f1" />
                    <text x="90" y="55" fill="#fff" font-size="20">→</text>
                    <rect x="130" y="30" width="40" height="40" fill="#4f46e5" />
                </svg>`;
        } else {
            visualBox.classList.add('hidden');
        }

        const optionsGrid = document.getElementById('options-grid');
        optionsGrid.innerHTML = '';
        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = "p-4 bg-slate-700/50 hover:bg-indigo-600/30 border border-slate-600 hover:border-indigo-500 rounded-xl text-right transition font-medium text-slate-200 flex justify-between items-center";
            btn.innerHTML = `<span>${opt}</span> <span class="text-xs text-slate-400 border border-slate-500 rounded px-2 py-0.5">${idx + 1}</span>`;
            btn.onclick = () => this.handleAnswer(idx);
            optionsGrid.appendChild(btn);
        });
    },

    handleAnswer(selectedIndex) {
        const timeTaken = (Date.now() - this.questionStartTime) / 1000;
        const currentQ = this.questions[this.currentIndex];
        
        this.userAnswers.push({
            isCorrect: selectedIndex === currentQ.correct,
            timeTaken: timeTaken,
            difficulty: currentQ.difficulty
        });

        this.currentIndex++;
        if (this.currentIndex < this.questions.length) {
            this.renderQuestion();
        } else {
            this.finishTest();
        }
    },

    finishTest() {
        clearInterval(this.timerInterval);
        document.getElementById('quiz-card').classList.add('hidden');
        document.getElementById('timer-box').classList.add('hidden');
        document.getElementById('result-card').classList.remove('hidden');

        const stats = IQEngine.calculateIQ(this.userAnswers);

        document.getElementById('iq-score').innerText = stats.iq;
        document.getElementById('iq-classification').innerText = stats.classification;
        document.getElementById('accuracy-stat').innerText = `${stats.accuracy}%`;
        document.getElementById('speed-stat').innerText = `${stats.avgTime} ثانية/سؤال`;
        document.getElementById('performance-eval').innerText = 
            stats.iq >= 115 ? "قدرات تحليلية متقدمة وسرعة معالجة عالية" : "أداء جيد ضمن النطاق المعياري الطبيعي";
    }
};