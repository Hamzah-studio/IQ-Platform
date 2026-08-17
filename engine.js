const IQEngine = {
    calculateIQ(results) {
        let totalWeightedPoints = 0;
        let maxWeightedPoints = 0;
        let totalTime = 0;

        results.forEach(res => {
            const weight = res.difficulty;
            maxWeightedPoints += weight;
            
            if (res.isCorrect) {
                let timeBonus = 1.0;
                if (res.timeTaken < 15) timeBonus = 1.15;
                else if (res.timeTaken > 45) timeBonus = 0.85;

                totalWeightedPoints += (weight * timeBonus);
            }
            totalTime += res.timeTaken;
        });

        const performanceRatio = totalWeightedPoints / maxWeightedPoints;
        const meanRatio = 0.52;
        const stdDevRatio = 0.22;
        
        let zScore = (performanceRatio - meanRatio) / stdDevRatio;
        
        let rawIQ = Math.round(100 + (zScore * 15));
        let finalIQ = Math.max(70, Math.min(160, rawIQ));

        return {
            iq: finalIQ,
            accuracy: Math.round((results.filter(r => r.isCorrect).length / results.length) * 100),
            avgTime: Math.round(totalTime / results.length),
            classification: this.getClassification(finalIQ)
        };
    },

    getClassification(iq) {
        if (iq >= 130) return "ذكاء متميز جداً (مستوى عبقرية / Mensa)";
        if (iq >= 120) return "ذكاء متفوق عالي";
        if (iq >= 110) return "فوق المتوسط العام";
        if (iq >= 90)  return "متوسط طبيعي";
        if (iq >= 80)  return "أقل من المتوسط";
        return "يميل للحد الأدنى الإدراكي";
    }
};