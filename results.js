// ====================================
// results.js
// ====================================

let paper = null;
let currentFilter = 'all';

window.onload = function () {
    const id = getCurrentPaper();
    paper = getPaper(id);

    if (!paper) {
        alert("Paper not found.");
        window.location.href = "index.html";
        return;
    }

    displayResults();
};

// ====================================
// Calculate and display results
// ====================================
function displayResults() {
    document.getElementById("paperTitle").innerText = 
        paper.title + " - Results";

    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    // Count scores
    paper.questions.forEach((q, index) => {
        const userAnswer = paper.answers[index];
        const correctAnswer = q.answer 
            ? q.answer.replace(/[^A-D]/g, "") 
            : null;

        if (!userAnswer) {
            skipped++;
        } else if (userAnswer === correctAnswer) {
            correct++;
        } else {
            wrong++;
        }
    });

    const total = paper.questions.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Update stats
    document.getElementById("correctCount").innerText = correct;
    document.getElementById("wrongCount").innerText = wrong;
    document.getElementById("skippedCount").innerText = skipped;
    document.getElementById("accuracy").innerText = accuracy + "%";

    // Auto-save attempt to localStorage for analytics
    autoSaveAttempt(total, total - skipped, correct, wrong, accuracy);

    // Display all questions
    displayQuestions();
}

// ====================================
// Auto-save attempt to localStorage
// ====================================
function autoSaveAttempt(total, attempted, correct, incorrect, accuracy) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const paperName = paper.title || 'Unknown';

        const newRow = {
            'Date': today,
            'PaperName': paperName,
            'Total': String(total),
            'Attempted': String(attempted),
            'Correct': String(correct),
            'Incorrect': String(incorrect),
            'Accuracy': accuracy + '%',
            'Time Taken': '60:00',
            _accuracy: accuracy,
            _attempted: attempted,
            _correct: correct,
            _incorrect: incorrect,
            _total: total
        };

        let existing = [];
        try {
            const raw = localStorage.getItem('examAttempts');
            if (raw) existing = JSON.parse(raw);
        } catch(e) {}

        // Overwrite by Date+PaperName
        const key = today + '|' + paperName;
        existing = existing.filter(r => (r['Date'] + '|' + r['PaperName']) !== key);
        existing.push(newRow);
        existing.sort((a, b) => (a['Date'] || '').localeCompare(b['Date'] || ''));

        localStorage.setItem('examAttempts', JSON.stringify(existing));
    } catch(e) {
        console.warn('Failed to auto-save attempt:', e);
    }
}

// ====================================
// Display questions based on filter
// ====================================
function displayQuestions() {
    const container = document.getElementById("resultsContainer");
    container.innerHTML = "";

    let hasResults = false;

    paper.questions.forEach((q, index) => {
        const userAnswer = paper.answers[index];
        const correctAnswer = q.answer 
            ? q.answer.replace(/[^A-D]/g, "") 
            : null;

        let status;
        if (!userAnswer) {
            status = 'skipped';
        } else if (userAnswer === correctAnswer) {
            status = 'correct';
        } else {
            status = 'wrong';
        }

        // Apply filter
        if (currentFilter !== 'all' && currentFilter !== status) {
            return;
        }

        hasResults = true;

        // Create result card
        const card = document.createElement("div");
        card.className = `question-result ${status}`;
        card.onclick = () => card.classList.toggle("expanded");

        const header = document.createElement("div");
        header.className = "question-header";

        const numCircle = document.createElement("div");
        numCircle.className = "question-number";
        numCircle.innerText = "Q" + (index + 1);

        const text = document.createElement("div");
        text.className = "question-text";
        text.innerText = q.question;

        const badge = document.createElement("div");
        badge.className = `status-badge ${status}`;
        badge.innerText = 
            status === 'correct' ? 'CORRECT' :
            status === 'wrong' ? 'WRONG' :
            'SKIPPED';

        header.appendChild(numCircle);
        header.appendChild(text);
        header.appendChild(badge);
        card.appendChild(header);

        // Compact user answer
        const yourAnswerText = document.createElement("div");
        yourAnswerText.className = `your-answer-text ${status}`;
        if (userAnswer) {
            const optionIndex = userAnswer.charCodeAt(0) - 65;
            if (q.options[optionIndex]) {
                yourAnswerText.innerText = `Your answer: (${userAnswer}) ${q.options[optionIndex]}`;
            } else {
                yourAnswerText.innerText = `Your answer: (${userAnswer})`;
            }
        } else {
            yourAnswerText.innerText = "Your answer: Not answered";
        }
        card.appendChild(yourAnswerText);

        const answerSection = document.createElement("div");
        answerSection.className = "answer-section";

        // Correct answer
        if (status !== 'correct' && correctAnswer) {
            const correctRow = document.createElement("div");
            correctRow.className = "answer-row";
            const correctLabel = document.createElement("div");
            correctLabel.className = "answer-label";
            correctLabel.innerText = "Correct answer:";
            const correctValue = document.createElement("div");
            correctValue.className = "answer-value correct";
            
            const optionIndex = correctAnswer.charCodeAt(0) - 65;
            if (q.options[optionIndex]) {
                correctValue.innerText = `(${correctAnswer}) ${q.options[optionIndex]}`;
            } else {
                correctValue.innerText = `(${correctAnswer})`;
            }
            
            correctRow.appendChild(correctLabel);
            correctRow.appendChild(correctValue);
            answerSection.appendChild(correctRow);
        }

        // Only append answer section if there's content inside it
        if (answerSection.hasChildNodes()) {
            card.appendChild(answerSection);
        }

        container.appendChild(card);
    });

    // Check if any results match filter
    if (!hasResults) {
        container.innerHTML = '<div class="empty-state">No questions to display</div>';
    }
}

// ====================================
// Filter results
// ====================================
function filterResults(filter) {
    currentFilter = filter;

    // Update active button
    document.querySelectorAll(".btn").forEach(btn => {
        btn.classList.remove("active");
    });
    event.target.classList.add("active");

    displayQuestions();
}
