// =======================================
// parser.js
// Reads TXT question papers
// =======================================

function importPaper(file) {

    if (!file) {
        alert("Please select a text file.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

        const text = event.target.result;

        const paper = parsePaper(text, file.name);

        addPaper(paper);

        alert("Paper imported successfully.");

        if (typeof loadPaperList === "function") {
            loadPaperList();
        }

    };

    reader.readAsText(file);

}

// =======================================
// Parse paper
// =======================================

function parsePaper(text, filename) {

    const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line !== "");

    const questions = [];

    let current = null;

    for (const line of lines) {

        // Question

        if (/^Q\.?\s*\d+/i.test(line)) {

            if (current) {
                questions.push(current);
            }

            current = {

                question: line,

                options: [],

                answer: null

            };

            continue;

        }

        // Options

        if (/^\(?[A-Da-d]\)?[.)]/.test(line)) {

            if (current) {

                current.options.push(line);

            }

            continue;

        }

        // Answer

        if (/^Ans/i.test(line)) {

            if (current) {

                current.answer = line;

            }

            continue;

        }

        // Continue question

        if (current && current.options.length === 0) {

            current.question += " " + line;

        }

    }

    if (current) {

        questions.push(current);

    }

    return {

        title: filename.replace(".txt", ""),

        totalQuestions: questions.length,

        questions: questions

    };

}
