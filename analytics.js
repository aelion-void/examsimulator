// ====================================
// analytics.js — Exam Attempt Tracker
// ====================================

let attemptData = []; // parsed rows
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();

// ---- CSV Parsing ----
function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((h, i) => row[h] = vals[i] || '');
        row._accuracy = parseFloat(row['Accuracy']) || 0;
        row._attempted = parseInt(row['Attempted']) || 0;
        row._correct = parseInt(row['Correct']) || 0;
        row._incorrect = parseInt(row['Incorrect']) || 0;
        row._total = parseInt(row['Total']) || 0;
        return row;
    }).filter(r => r['Date']);
}

function serializeCSV(data) {
    const headers = ['Date','PaperName','Total','Attempted','Correct','Incorrect','Accuracy','Time Taken'];
    const rows = data.map(r => headers.map(h => r[h] || '').join(','));
    return [headers.join(','), ...rows].join('\n');
}

// ---- localStorage helpers ----
function loadFromStorage() {
    try {
        const raw = localStorage.getItem('examAttempts');
        if (raw) return JSON.parse(raw);
    } catch(e) {}
    return [];
}

function saveToStorage(data) {
    localStorage.setItem('examAttempts', JSON.stringify(data));
}

// ---- Merge data sources (CSV + localStorage), dedup by Date+PaperName ----
function mergeData(sources) {
    const map = {};
    sources.flat().forEach(r => {
        const key = r['Date'] + '|' + r['PaperName'];
        map[key] = r; // latest wins (overwrite)
    });
    return Object.values(map).sort((a, b) => a['Date'].localeCompare(b['Date']));
}

// ---- Accuracy Color ----
function accuracyColor(pct) {
    if (!pct && pct !== 0) return '#f1f5f9';
    if (pct >= 90) return '#065f46';
    if (pct >= 80) return '#10b981';
    if (pct >= 70) return '#34d399';
    if (pct >= 60) return '#6ee7b7';
    if (pct > 0)   return '#a7f3d0';
    return '#fecaca'; // 0% accuracy
}

function accuracyTextColor(pct) {
    if (pct >= 80) return '#fff';
    return '#1e293b';
}

// ---- Calendar Renderer (single month with day numbers) ----
function renderCalendar() {
    const container = document.getElementById('calendarContainer');
    if (!container) return;
    container.innerHTML = '';

    // Build date lookup
    const byDate = {};
    attemptData.forEach(r => { byDate[r['Date']] = r; });

    const year = calendarYear;
    const month = calendarMonth;
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

    // Nav header
    const nav = document.createElement('div');
    nav.className = 'cal-nav';
    nav.innerHTML = `
        <button class="cal-nav-btn" id="calPrev">◀</button>
        <span class="cal-nav-title">${monthName}</span>
        <button class="cal-nav-btn" id="calNext">▶</button>
    `;
    container.appendChild(nav);

    // Day headers
    const dayHeaders = document.createElement('div');
    dayHeaders.className = 'cal-grid cal-header-row';
    ['S','M','T','W','T','F','S'].forEach(d => {
        const cell = document.createElement('div');
        cell.className = 'cal-day-header';
        cell.textContent = d;
        dayHeaders.appendChild(cell);
    });
    container.appendChild(dayHeaders);

    // Day cells
    const grid = document.createElement('div');
    grid.className = 'cal-grid';

    const firstDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement('div');
        blank.className = 'cal-cell cal-blank';
        grid.appendChild(blank);
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const row = byDate[dateStr];
        const cell = document.createElement('div');
        cell.className = 'cal-cell';

        if (row) {
            cell.style.background = accuracyColor(row._accuracy);
            cell.style.color = accuracyTextColor(row._accuracy);
            cell.title = `${row['PaperName']}\nAccuracy: ${row['Accuracy']}\nAttempted: ${row['Attempted']}/${row['Total']}\nTime: ${row['Time Taken']}`;
            cell.classList.add('cal-practiced');
        }

        if (dateStr === todayStr) {
            cell.classList.add('cal-today');
        }

        cell.textContent = d;
        grid.appendChild(cell);
    }

    container.appendChild(grid);

    // Bind nav
    document.getElementById('calPrev').onclick = () => {
        calendarMonth--;
        if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
        renderCalendar();
    };
    document.getElementById('calNext').onclick = () => {
        const now = new Date();
        if (calendarYear > now.getFullYear() || (calendarYear === now.getFullYear() && calendarMonth >= now.getMonth())) return;
        calendarMonth++;
        if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
        renderCalendar();
    };
}

// ---- Stats Renderer ----
function renderStats() {
    if (!attemptData.length) return;

    const totalDays = attemptData.length;
    const totalAttempted = attemptData.reduce((s, r) => s + r._attempted, 0);
    const avgAccuracy = (attemptData.reduce((s, r) => s + r._accuracy, 0) / totalDays).toFixed(1);
    const bestAccuracy = Math.max(...attemptData.map(r => r._accuracy)).toFixed(1);

    // Streak
    const sortedDates = [...new Set(attemptData.map(r => r['Date']))].sort();
    let maxStreak = 1, curStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i-1]);
        const curr = new Date(sortedDates[i]);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diff === 1) { curStreak++; maxStreak = Math.max(maxStreak, curStreak); }
        else curStreak = 1;
    }

    setEl('stat-days', totalDays);
    setEl('stat-attempted', totalAttempted);
    setEl('stat-avg-acc', avgAccuracy + '%');
    setEl('stat-best-acc', bestAccuracy + '%');
    setEl('stat-streak', maxStreak + ' days');

    // Today
    const today = new Date().toISOString().split('T')[0];
    const todayRow = attemptData.find(r => r['Date'] === today);
    if (todayRow) {
        setEl('today-attempted', todayRow['Attempted']);
        setEl('today-correct', todayRow['Correct']);
        setEl('today-incorrect', todayRow['Incorrect']);
        setEl('today-accuracy', todayRow['Accuracy']);
        setEl('today-time', todayRow['Time Taken']);
        document.getElementById('today-block')?.removeAttribute('hidden');
    }

    renderWeeklyChart();
}

function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

// ---- Tiny Weekly Bar Chart ----
function renderWeeklyChart() {
    const canvas = document.getElementById('weeklyChart');
    if (!canvas || !canvas.getContext) return;

    const weeks = {};
    attemptData.forEach(r => {
        const d = new Date(r['Date']);
        const wk = getWeekKey(d);
        if (!weeks[wk]) weeks[wk] = { acc: [], attempted: 0 };
        weeks[wk].acc.push(r._accuracy);
        weeks[wk].attempted += r._attempted;
    });

    const keys = Object.keys(weeks).sort().slice(-8);
    if (!keys.length) return;
    const accs = keys.map(k => (weeks[k].acc.reduce((a,b) => a+b, 0) / weeks[k].acc.length));
    const maxAcc = 100;

    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const barW = Math.max(8, w / keys.length - 4);
    ctx.clearRect(0, 0, w, h);

    keys.forEach((k, i) => {
        const barH = (accs[i] / maxAcc) * (h - 20);
        const x = i * (w / keys.length) + 2;
        const y = h - barH - 14;
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 3);
        ctx.fill();
        ctx.fillStyle = '#64748b';
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(k.slice(5), x + barW / 2, h - 2);
        ctx.fillStyle = '#1e293b';
        ctx.fillText(Math.round(accs[i]) + '%', x + barW / 2, y - 2);
    });
}

function getWeekKey(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2,'0')}`;
}

// ---- Init ----
function initAnalytics() {
    // Load from localStorage automatically
    const stored = loadFromStorage();
    if (stored.length) {
        attemptData = mergeData([stored]);
        renderCalendar();
        renderStats();
    } else {
        renderCalendar(); // show empty calendar
    }

    // CSV file upload (merges with existing)
    const fileInput = document.getElementById('csvFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                const csvRows = parseCSV(e.target.result);
                attemptData = mergeData([attemptData, csvRows]);
                saveToStorage(attemptData);
                renderCalendar();
                renderStats();
            };
            reader.readAsText(file);
        });
    }

    // Log form submission
    document.getElementById('logForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const fd = new FormData(this);
        const correct = parseInt(fd.get('correct')) || 0;
        const attempted = parseInt(fd.get('attempted')) || 0;
        const incorrect = attempted - correct;
        const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) + '%' : '0%';

        const newRow = {
            'Date': fd.get('date'),
            'PaperName': fd.get('paper'),
            'Total': fd.get('total'),
            'Attempted': String(attempted),
            'Correct': String(correct),
            'Incorrect': String(incorrect),
            'Accuracy': accuracy,
            'Time Taken': fd.get('time'),
            _accuracy: parseFloat(accuracy),
            _attempted: attempted,
            _correct: correct,
            _incorrect: incorrect,
            _total: parseInt(fd.get('total')) || 0
        };

        attemptData = mergeData([attemptData, [newRow]]);
        saveToStorage(attemptData);
        renderCalendar();
        renderStats();
        this.reset();

        const msg = document.getElementById('logSuccessMsg');
        if (msg) { msg.hidden = false; setTimeout(() => msg.hidden = true, 2500); }
    });

    // Export CSV
    document.getElementById('exportCsvBtn')?.addEventListener('click', function() {
        if (!attemptData.length) return alert('No data to export.');
        const blob = new Blob([serializeCSV(attemptData)], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'exam_attempts_log.csv';
        a.click();
    });
}

document.addEventListener('DOMContentLoaded', initAnalytics);
