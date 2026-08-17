const QuestionBank = {
    generateNumericalSequence() {
        const types = ['arithmetic', 'geometric', 'fibonacci', 'interleaved'];
        const chosen = types[Math.floor(Math.random() * types.length)];
        
        let seq = [], answer = 0, options = [], text = "";

        if (chosen === 'arithmetic') {
            const start = Math.floor(Math.random() * 20) + 1;
            const diff = (Math.floor(Math.random() * 7) + 2) * (Math.random() > 0.5 ? 1 : -1);
            seq = [start, start + diff, start + 2*diff, start + 3*diff];
            answer = start + 4*diff;
            text = `ما هو الرقم التالي في السلسلة: [ ${seq.join(', ')} , ؟ ]`;
        } else if (chosen === 'geometric') {
            const start = Math.floor(Math.random() * 5) + 1;
            const ratio = Math.floor(Math.random() * 3) + 2;
            seq = [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio];
            answer = seq[3] * ratio;
            text = `أكمل المتتالية الهندسية: [ ${seq.join(', ')} , ؟ ]`;
        } else if (chosen === 'fibonacci') {
            const a = Math.floor(Math.random() * 5) + 1;
            const b = Math.floor(Math.random() * 5) + 2;
            seq = [a, b, a+b, a+2*b, 2*a+3*b];
            answer = 3*a + 5*b;
            text = `اكتشف النمط وأكمل السلسلة: [ ${seq.join(', ')} , ؟ ]`;
        } else {
            const d1 = 2, d2 = -1;
            let base = 10;
            seq = [base, base+5, base+d1, base+5+d2, base+2*d1, base+5+2*d2];
            answer = base + 3*d1;
            text = `ما الرقم الذي يحل محل المجهول: [ ${seq.join(', ')} , ؟ ]`;
        }

        options = [answer, answer + 2, answer - 3, answer + 5].sort(() => Math.random() - 0.5);
        return {
            category: "المنطق الرياضي",
            text: text,
            options: options.map(String),
            correct: options.indexOf(answer),
            difficulty: 1.2
        };
    },

    staticQuestions: [
        {
            category: "التناظر اللفظي",
            text: "محيط : دائرة :: ...... : مربع",
            options: ["مساحة", "ضلع", "محيط", "قطر"],
            correct: 2,
            difficulty: 1.0
        },
        {
            category: "التحليل المنطقي",
            text: "إذا كان كل (س) هو (ص)، وبعض (ص) هو (ع)، أي من العبارات التالية صحيحة حتماً؟",
            options: [
                "كل (س) هو (ع)",
                "بعض (س) ليس (ص)",
                "قد يكون بعض (س) هو (ع)",
                "لا شيء مما سبق صحيح حتماً"
            ],
            correct: 2,
            difficulty: 1.5
        },
        {
            category: "التفكير الفضائي",
            text: "إذا تم طي ورقة مربعة مرتين متتاليتين من المنتصف ثم قُصت زاوية المطوية على شكل مثلث، كيف ستبدو الورقة عند فتحها؟",
            options: ["ثقب واحد في المركز", "4 ثقوب مربعة", "ثقب على شكل معين في المركز", "4 ثقوب على الأطراف"],
            correct: 2,
            difficulty: 1.4
        },
        {
            category: "الذاكرة والسرعة الإدراكية",
            text: "أي من الأشكال التالية يمثل الدوران المائل بمقدار 90 درجة باتجاه عقارب الساعة للكلمة رمزية 'Δ - □ - O'؟",
            options: ["O - □ - Δ", "Δ عمودي", "نفس الترتيب مع تدوير العناصر", "لا يتغير الترتيب"],
            correct: 2,
            difficulty: 1.1
        }
    ],

    generateVisualMatrix() {
        const shapes = ['circle', 'rect', 'triangle'];
        const chosenShape = shapes[Math.floor(Math.random() * shapes.length)];
        
        return {
            category: "المصفوفات البصرية",
            text: "اختر الشكل المكمل للمصفوفة البصرية بناءً على منطق التغير الأفقي والعمودي:",
            isVisual: true,
            matrixType: chosenShape,
            options: ["الشكل (أ) - زيادة الحجم مع التظليل", "الشكل (ب) - نقصان الحجم", "الشكل (ج) - تدوير عكسي", "الشكل (د) - تطابق تام"],
            correct: 0,
            difficulty: 1.6
        };
    },

    getTestSet(total = 10) {
        let testSet = [];
        for(let i = 0; i < Math.floor(total / 2); i++) {
            testSet.push(this.generateNumericalSequence());
        }
        testSet.push(this.generateVisualMatrix());
        testSet = testSet.concat(this.staticQuestions);
        
        return testSet.sort(() => Math.random() - 0.5).slice(0, total);
    }
};