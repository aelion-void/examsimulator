// ====================================
// exam.js
// ====================================

let paper = null;
let currentQuestion = 0;

let totalTime = 60 * 60;

let totalTimer;

// -----------------------------

window.onload = function () {

    const id = getCurrentPaper();
    paper = getPaper(id);

    if (!paper) {
        alert("Paper not found.");
        window.location.href = "index.html";
        return;
    }

    document.getElementById("paperTitle").innerText = paper.title;
    document.getElementById("totalQuestions").innerText = paper.totalQuestions;

    if (!paper.answers) paper.answers = [];
    if (!paper.review) paper.review = [];
    if (!paper.currentQuestion) paper.currentQuestion = 0;

    currentQuestion = paper.currentQuestion;

    createPalette();
    loadQuestion();

    // Event Listeners for Header controls
    document.getElementById("startExamBtn").onclick = function() {
        document.getElementById("startModal").classList.add("hidden");
        
        // Clear previous answers on start to ensure a fresh session
        paper.answers = [];
        paper.review = [];
        paper.currentQuestion = 0;
        currentQuestion = 0;
        updatePaper(paper);
        updatePalette();
        loadQuestion();
        
        startTimers();
    };

    document.getElementById("exitBtn").onclick = function() {
        if (confirm("Are you sure you want to exit? Your progress is saved.")) {
            clearInterval(totalTimer);
            window.location.href = "index.html";
        }
    };

    document.getElementById("togglePaletteBtn").onclick = function() {
        document.querySelector(".exam-layout").classList.toggle("palette-closed");
    };

}

// -----------------------------

function loadQuestion() {

    paper.currentQuestion = currentQuestion;

    updatePaper(paper);

    const q = paper.questions[currentQuestion];

    document.getElementById("questionNumber").innerText =
        currentQuestion + 1;

    document.getElementById("questionText").innerText =
        q.question;

    const options =
        document.getElementById("optionsContainer");

    options.innerHTML = "";

    q.options.forEach((option, index) => {

        const div = document.createElement("label");

        div.className = "option";

        const letter = String.fromCharCode(65 + index);
        const isChecked = paper.answers[currentQuestion] === letter;

        if (isChecked) {
            div.classList.add("selected");
        }

        div.innerHTML = `
            <input
                type="radio"
                name="answer"
                value="${letter}"
                ${isChecked ? "checked" : ""}
            >
            ${option}
        `;

        div.querySelector("input")
            .addEventListener("change", function () {
                paper.answers[currentQuestion] = this.value;
                updatePaper(paper);
                updatePalette();

                // Update styling
                document.querySelectorAll(".option").forEach(opt => opt.classList.remove("selected"));
                div.classList.add("selected");
            });

        options.appendChild(div);

    });

    updatePalette();

}

// -----------------------------

function nextQuestion() {

    if (currentQuestion <
        paper.questions.length - 1) {

        currentQuestion++;

        loadQuestion();

    }

}

// -----------------------------

function previousQuestion() {

    if (currentQuestion > 0) {

        currentQuestion--;

        loadQuestion();

    }

}

// -----------------------------

function markReview() {

    paper.review[currentQuestion] =
        !paper.review[currentQuestion];

    updatePaper(paper);

    updatePalette();

}

// -----------------------------

function createPalette() {

    const palette =
        document.getElementById("questionPalette");

    palette.innerHTML = "";

    for (let i = 0; i < paper.questions.length; i++) {

        const btn =
            document.createElement("button");

        btn.innerText = i + 1;

        btn.className = "palette-btn";

        btn.onclick = function () {

            currentQuestion = i;

            loadQuestion();

        };

        palette.appendChild(btn);

    }

}

// -----------------------------

function updatePalette() {

    const buttons =
        document.querySelectorAll(".palette-btn");

    buttons.forEach((btn, index) => {

        btn.className = "palette-btn";

        if (paper.answers[index])
            btn.classList.add("answered");

        if (paper.review[index])
            btn.classList.add("review");

        if (index === currentQuestion)
            btn.classList.add("current");

    });

}

// -----------------------------

document
.getElementById("previousBtn")
.onclick = previousQuestion;

document
.getElementById("saveNextBtn")
.onclick = nextQuestion;

document
.getElementById("markBtn")
.onclick = markReview;

// -----------------------------

document.getElementById("submitExamBtn").onclick = function () {
    if (!confirm("Submit Exam?"))
        return;
    
    clearInterval(totalTimer);
    updatePaper(paper);
    window.location.href = "results.html";
};

// -----------------------------

function startTimers() {
    totalTimer = setInterval(function () {
        totalTime--;
        displayTotal();

        if (totalTime <= 0) {
            clearInterval(totalTimer);
            alert("Time Over");
            updatePaper(paper);
            window.location.href = "results.html";
        }
    }, 1000);
}

// -----------------------------

function displayTotal() {

    const m =
        Math.floor(totalTime / 60);

    const s =
        totalTime % 60;

    document
        .getElementById("totalTimer")
        .innerText =
        String(m).padStart(2, "0") +
        ":" +
        String(s).padStart(2, "0");

}

// -----------------------------

// Section timer logic removed

// ====================================
// New Attempt - Clear all answers
// ====================================

function newAttempt() {
    if (!confirm("Clear all answers and start fresh?")) {
        return;
    }

    paper.answers = [];
    paper.review = [];
    paper.currentQuestion = 0;
    currentQuestion = 0;
    
    updatePaper(paper);
    
    // Reset timers
    clearInterval(totalTimer);
    totalTime = 60 * 60;
    
    // Reload
    loadQuestion();
    document.getElementById("startModal").classList.remove("hidden");
    
    alert("Answers cleared. Starting fresh!");
}
