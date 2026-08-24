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

    // Display all questions
    displayQuestions();
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

        const header = document.createElement("div");
        header.className = "question-header";

        const numCircle = document.createElement("div");
        numCircle.className = "question-number";
        numCircle.innerText = index + 1;

        const text = document.createElement("div");
        text.className = "question-text";
        text.innerText = q.question;

        const badge = document.createElement("div");
        badge.className = `status-badge ${status}`;
        badge.innerText = 
            status === 'correct' ? '✓ Correct' :
            status === 'wrong' ? '✗ Wrong' :
            '- Skipped';

        header.appendChild(numCircle);
        header.appendChild(text);
        header.appendChild(badge);

        const answerSection = document.createElement("div");
        answerSection.className = "answer-section";

        // User answer
        const userAnswerRow = document.createElement("div");
        userAnswerRow.className = "answer-row";
        const userLabel = document.createElement("div");
        userLabel.className = "answer-label";
        userLabel.innerText = "Your answer:";
        const userValue = document.createElement("div");
        userValue.className = `answer-value ${status !== 'skipped' ? status : ''}`;
        
        if (userAnswer) {
            const optionIndex = userAnswer.charCodeAt(0) - 65;
            if (q.options[optionIndex]) {
                userValue.innerText = `(${userAnswer}) ${q.options[optionIndex]}`;
            } else {
                userValue.innerText = `(${userAnswer})`;
            }
        } else {
            userValue.innerText = "Not answered";
        }

        userAnswerRow.appendChild(userLabel);
        userAnswerRow.appendChild(userValue);
        answerSection.appendChild(userAnswerRow);

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

        card.appendChild(header);
        card.appendChild(answerSection);
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
