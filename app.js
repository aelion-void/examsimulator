// ====================================
// app.js
// Home Page Logic
// ====================================

document.addEventListener("DOMContentLoaded", () => {

    loadPaperList();

    const importBtn = document.getElementById("importBtn");

    importBtn.addEventListener("click", () => {

        const fileInput = document.getElementById("paperFile");

        if (fileInput.files.length === 0) {

            alert("Select a .txt paper first.");

            return;

        }

        importPaper(fileInput.files[0]);

        fileInput.value = "";

    });

});

// ====================================
// Display all papers
// ====================================

let currentPaperFilter = 'all';

function loadPaperList(filter) {
    if (filter !== undefined) currentPaperFilter = filter;

    const container = document.getElementById("paperList");
    container.innerHTML = "";

    let papers = getPapers();

    // Apply filter
    if (currentPaperFilter !== 'all') {
        papers = papers.filter(p =>
            p.title && p.title.toLowerCase().includes(currentPaperFilter.toLowerCase())
        );
    }

    if (papers.length === 0) {
        container.innerHTML = `<p>No ${currentPaperFilter === 'all' ? '' : currentPaperFilter + ' '}papers found.</p>`;
        return;
    }

    papers.forEach(paper => {
        const div = document.createElement("div");
        div.className = "paper-item";
        div.innerHTML = `
            <div>
                <h3>${paper.title}</h3>
                <p>${paper.totalQuestions} Questions</p>
                <small>${paper.created}</small>
            </div>
            <div class="paper-buttons">
                <button onclick="startExam(${paper.id})">Start</button>
                <button class="delete-btn" onclick="removePaper(${paper.id})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function filterPapers(filter, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadPaperList(filter);
}

// ====================================
// Start Exam
// ====================================

function startExam(id) {

    setCurrentPaper(id);

    window.location.href = "exam.html";

}

// ====================================
// Delete Paper
// ====================================

function removePaper(id) {

    const ok = confirm("Delete this paper?");

    if (!ok) return;

    deletePaper(id);

    loadPaperList();

}
