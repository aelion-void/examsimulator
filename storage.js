// ===============================
// storage.js
// Handles localStorage operations
// ===============================

const STORAGE_KEY = "nta_exam_papers";
const CURRENT_PAPER_KEY = "nta_current_paper";

// -------------------------------
// Get all saved papers
// -------------------------------
function getPapers() {
    const papers = localStorage.getItem(STORAGE_KEY);

    if (!papers) {
        return [];
    }

    return JSON.parse(papers);
}

// -------------------------------
// Save all papers
// -------------------------------
function savePapers(papers) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(papers)
    );
}

// -------------------------------
// Add new paper
// -------------------------------
function addPaper(paper) {

    const papers = getPapers();

    paper.id = Date.now();

    paper.created = new Date().toLocaleString();

    paper.answers = [];

    paper.review = [];

    paper.currentQuestion = 0;

    papers.push(paper);

    savePapers(papers);

}

// -------------------------------
// Delete paper
// -------------------------------
function deletePaper(id) {

    const papers = getPapers().filter(

        paper => paper.id !== id

    );

    savePapers(papers);

}

// -------------------------------
// Get paper by ID
// -------------------------------
function getPaper(id) {

    const papers = getPapers();

    return papers.find(

        paper => paper.id === id

    );

}

// -------------------------------
// Update paper
// -------------------------------
function updatePaper(updatedPaper) {

    const papers = getPapers();

    const index = papers.findIndex(

        paper => paper.id === updatedPaper.id

    );

    if (index !== -1) {

        papers[index] = updatedPaper;

        savePapers(papers);

    }

}

// -------------------------------
// Store current paper
// -------------------------------
function setCurrentPaper(id) {

    localStorage.setItem(

        CURRENT_PAPER_KEY,

        id

    );

}

// -------------------------------
// Get current paper
// -------------------------------
function getCurrentPaper() {

    return Number(

        localStorage.getItem(

            CURRENT_PAPER_KEY

        )

    );

}

// -------------------------------
// Clear all papers
// -------------------------------
function clearAllPapers() {

    localStorage.removeItem(STORAGE_KEY);

    localStorage.removeItem(CURRENT_PAPER_KEY);

}

// -------------------------------
// Check if papers exist
// -------------------------------
function hasPapers() {

    return getPapers().length > 0;

}

// -------------------------------
// Export papers (future use)
// -------------------------------
function exportPapers() {

    return JSON.stringify(

        getPapers(),

        null,

        2

    );

}
