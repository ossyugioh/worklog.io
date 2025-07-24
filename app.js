document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const settingsScreen = document.getElementById('settings-screen');
    const dailyLogScreen = document.getElementById('daily-log-screen');
    const exportScreen = document.getElementById('export-screen');

    // Settings Screen Elements
    const userFirstNameInput = document.getElementById('user-first-name');
    const userLastNameInput = document.getElementById('user-last-name');
    const userPositionInput = document.getElementById('user-position');
    const workplaceNameInput = document.getElementById('workplace-name');
    const newFrequentTaskInput = document.getElementById('new-frequent-task');
    const addFrequentTaskBtn = document.getElementById('add-frequent-task-btn');
    const frequentTasksList = document.getElementById('frequent-tasks-list');
    const newFrequentSubjectInput = document.getElementById('new-frequent-subject');
    const addFrequentSubjectBtn = document.getElementById('add-frequent-subject-btn');
    const frequentSubjectsList = document.getElementById('frequent-subjects-list');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    // Daily Log Screen Elements
    const dailyLogHeader = document.getElementById('daily-log-header');
    const datePicker = document.getElementById('date-picker');
    const goToSettingsBtn = document.getElementById('go-to-settings-btn');
    const frequentTasksCheckboxes = document.getElementById('frequent-tasks-checkboxes');
    const otherTaskInput = document.getElementById('other-task-input');
    const frequentSubjectsCheckboxes = document.getElementById('frequent-subjects-checkboxes');
    const otherSubjectInput = document.getElementById('other-subject-input');
    const notesInput = document.getElementById('notes-input');
    const leaveCheckbox = document.getElementById('leave-checkbox');
    const leaveReasonInput = document.getElementById('leave-reason');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const exportScreenBtn = document.getElementById('export-screen-btn');

    // Export Screen Elements
    const backToLogBtn = document.getElementById('back-to-log-btn');
    const monthSelector = document.getElementById('month-selector');
    const exportPreviewTableBody = document.querySelector('#export-preview-table tbody');
    const exportExcelBtn = document.getElementById('export-excel-btn');

    // --- App State & Data ---
    let userData = {
        firstName: '',
        lastName: '',
        position: '',
        workplace: '',
        frequentTasks: [],
        frequentSubjects: []
    };
    let dailyLogs = {}; // { 'YYYY-MM-DD': { tasks: [], subjects: [], notes: '', image: null, leave: false, leaveReason: '' } }

    // --- Data Persistence ---
    const saveData = () => {
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('dailyLogs', JSON.stringify(dailyLogs));
    };

    const loadData = () => {
        const savedUserData = localStorage.getItem('userData');
        const savedDailyLogs = localStorage.getItem('dailyLogs');
        if (savedUserData) {
            const parsedData = JSON.parse(savedUserData);
            // Migrate old 'name' to 'firstName' if exists
            if (parsedData.name && !parsedData.firstName) {
                parsedData.firstName = parsedData.name;
                delete parsedData.name;
            }
            userData = { ...userData, ...parsedData };
        }
        if (savedDailyLogs) {
            dailyLogs = JSON.parse(savedDailyLogs);
        }
    };

    // --- UI Rendering ---
    const createListRenderer = (listEl, dataArray, renderFunc) => {
        listEl.innerHTML = '';
        dataArray.forEach((item, index) => {
            const li = document.createElement('li');

            const textSpan = document.createElement('span');
            textSpan.textContent = item;
            li.appendChild(textSpan);

            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'item-buttons';

            const editBtn = document.createElement('button');
            editBtn.textContent = 'แก้ไข';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => {
                const newText = prompt(`แก้ไขรายการ:`, item);
                if (newText !== null && newText.trim() !== '') {
                    dataArray[index] = newText.trim();
                    renderFunc();
                    saveData();
                }
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'ลบ';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => {
                if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${item}"?`)) {
                    dataArray.splice(index, 1);
                    renderFunc();
                    saveData();
                }
            };

            buttonGroup.appendChild(editBtn);
            buttonGroup.appendChild(deleteBtn);
            li.appendChild(buttonGroup);
            listEl.appendChild(li);
        });
    };

    const renderFrequentTasks = () => createListRenderer(frequentTasksList, userData.frequentTasks, renderFrequentTasks);
    const renderFrequentSubjects = () => createListRenderer(frequentSubjectsList, userData.frequentSubjects, renderFrequentSubjects);

    const createCheckboxRenderer = (containerEl, dataArray, prefix) => {
        containerEl.innerHTML = '';
        dataArray.forEach(item => {
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${prefix}-${item.replace(/\s+/g, '-')}`;
            checkbox.value = item;
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = item;
            div.appendChild(checkbox);
            div.appendChild(label);
            containerEl.appendChild(div);
        });
    };

    const renderFrequentTaskCheckboxes = () => createCheckboxRenderer(frequentTasksCheckboxes, userData.frequentTasks, 'task');
    const renderFrequentSubjectCheckboxes = () => createCheckboxRenderer(frequentSubjectsCheckboxes, userData.frequentSubjects, 'subject');

    const showScreen = (screen) => {
        settingsScreen.style.display = 'none';
        dailyLogScreen.style.display = 'none';
        exportScreen.style.display = 'none';
        screen.style.display = 'flex';
    };

    const updateDailyLogView = (date) => {
        datePicker.value = date;
        const log = dailyLogs[date] || { tasks: [], subjects: [], notes: '', image: null, leave: false, leaveReason: '' };

        // Reset fields
        document.querySelectorAll('#frequent-tasks-checkboxes input, #frequent-subjects-checkboxes input').forEach(cb => cb.checked = false);
        otherTaskInput.value = '';
        otherSubjectInput.value = '';

        // Populate tasks
        const frequentTasksInLog = log.tasks.filter(t => userData.frequentTasks.includes(t));
        const otherTasksInLog = log.tasks.filter(t => !userData.frequentTasks.includes(t));
        frequentTasksInLog.forEach(task => {
            const checkbox = document.getElementById(`task-${task.replace(/\s+/g, '-')}`);
            if (checkbox) checkbox.checked = true;
        });
        otherTaskInput.value = otherTasksInLog.join(', ');

        // Populate subjects
        const frequentSubjectsInLog = log.subjects.filter(s => userData.frequentSubjects.includes(s));
        const otherSubjectsInLog = log.subjects.filter(s => !userData.frequentSubjects.includes(s));
        frequentSubjectsInLog.forEach(subject => {
            const checkbox = document.getElementById(`subject-${subject.replace(/\s+/g, '-')}`);
            if (checkbox) checkbox.checked = true;
        });
        otherSubjectInput.value = otherSubjectsInLog.join(', ');

        notesInput.value = log.notes;
        leaveCheckbox.checked = log.leave;
        leaveReasonInput.style.display = log.leave ? 'block' : 'none';
        leaveReasonInput.value = log.leaveReason;

        if (log.image) {
            imagePreview.src = log.image;
            imagePreview.style.display = 'block';
        } else {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
        }
    };

    const saveCurrentLog = () => {
        const date = datePicker.value;
        if (!date) return;

        const getSelectedItems = (containerId, otherInputId) => {
            const selected = Array.from(document.querySelectorAll(`#${containerId} input:checked`)).map(cb => cb.value);
            const other = document.getElementById(otherInputId).value.trim();
            if (other) {
                selected.push(...other.split(',').map(s => s.trim()).filter(Boolean));
            }
            return selected;
        };

        const log = {
            tasks: getSelectedItems('frequent-tasks-checkboxes', 'other-task-input'),
            subjects: getSelectedItems('frequent-subjects-checkboxes', 'other-subject-input'),
            notes: notesInput.value.trim(),
            image: imagePreview.src.startsWith('data:image') ? imagePreview.src : null,
            leave: leaveCheckbox.checked,
            leaveReason: leaveReasonInput.value.trim()
        };

        dailyLogs[date] = log;
        saveData();
    };

    const populateExportTable = () => {
        exportPreviewTableBody.innerHTML = '';
        const [year, month] = monthSelector.value.split('-');
        if (!year || !month) return;

        Object.keys(dailyLogs).sort().forEach(date => {
            if (date.startsWith(`${year}-${month}`)) {
                const log = dailyLogs[date];
                const tr = document.createElement('tr');
                const displayDate = new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

                tr.innerHTML = `
                    <td>${displayDate}</td>
                    <td>${log.leave ? `ลา (${log.leaveReason})` : (log.tasks || []).join(', ')}</td>
                    <td>${(log.subjects || []).join(', ')}</td>
                    <td>${log.notes}</td>
                    <td>${log.image ? 'มี' : 'ไม่มี'}</td>
                `;
                exportPreviewTableBody.appendChild(tr);
            }
        });
    };

    // --- Event Listeners ---
    const addToList = (inputEl, dataArray, renderFunc) => {
        const item = inputEl.value.trim();
        if (item && !dataArray.includes(item)) {
            dataArray.push(item);
            inputEl.value = '';
            renderFunc();
            saveData();
        }
    };

    addFrequentTaskBtn.onclick = () => addToList(newFrequentTaskInput, userData.frequentTasks, renderFrequentTasks);
    addFrequentSubjectBtn.onclick = () => addToList(newFrequentSubjectInput, userData.frequentSubjects, renderFrequentSubjects);

    saveSettingsBtn.onclick = () => {
        userData.firstName = userFirstNameInput.value.trim();
        userData.lastName = userLastNameInput.value.trim();
        userData.position = userPositionInput.value.trim();
        userData.workplace = workplaceNameInput.value.trim();
        saveData();
        dailyLogHeader.textContent = `บันทึกประจำวัน - ${userData.firstName} ${userData.lastName}`.trim();
        renderFrequentTaskCheckboxes();
        renderFrequentSubjectCheckboxes();
        showScreen(dailyLogScreen);
        updateDailyLogView(new Date().toISOString().split('T')[0]);
    };

    goToSettingsBtn.onclick = () => {
        userFirstNameInput.value = userData.firstName;
        userLastNameInput.value = userData.lastName;
        userPositionInput.value = userData.position;
        workplaceNameInput.value = userData.workplace;
        renderFrequentTasks();
        renderFrequentSubjects();
        showScreen(settingsScreen);
    };

    datePicker.onchange = () => {
        saveCurrentLog(); // Save previous date's log before switching
        updateDailyLogView(datePicker.value);
    };

    // Auto-save on input change
    [otherTaskInput, otherSubjectInput, notesInput, leaveReasonInput].forEach(input => {
        input.addEventListener('input', saveCurrentLog);
    });
    [frequentTasksCheckboxes, frequentSubjectsCheckboxes].forEach(container => {
        container.addEventListener('change', saveCurrentLog);
    });
    leaveCheckbox.addEventListener('change', () => {
        leaveReasonInput.style.display = leaveCheckbox.checked ? 'block' : 'none';
        saveCurrentLog();
    });

    imageInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                saveCurrentLog();
            };
            reader.readAsDataURL(file);
        }
    };

    exportScreenBtn.onclick = () => {
        saveCurrentLog(); // Ensure latest data is saved
        const today = new Date();
        monthSelector.value = today.toISOString().slice(0, 7);
        populateExportTable();
        showScreen(exportScreen);
    };

    backToLogBtn.onclick = () => {
        showScreen(dailyLogScreen);
    };

    monthSelector.onchange = populateExportTable;

    exportExcelBtn.onclick = () => {
        const [year, month] = monthSelector.value.split('-');
        const monthName = new Date(year, month - 1).toLocaleDateString('th-TH', { month: 'long' });
        const fileName = `รายงานการทำงาน_${userData.firstName || ''}${userData.lastName ? ' ' + userData.lastName : ''}_${monthName}_${year}.xlsx`;

        const dataToExport = [
            ['วันที่', 'งานที่ทำ', 'วิชาที่สอน', 'หมายเหตุ']
        ];

        Object.keys(dailyLogs).sort().forEach(date => {
            if (date.startsWith(`${year}-${month}`)) {
                const log = dailyLogs[date];
                const displayDate = new Date(date).toLocaleDateString('th-TH');
                const taskDescription = log.leave ? `ลา (${log.leaveReason})` : (log.tasks || []).join(', ');
                const subjectDescription = (log.subjects || []).join(', ');
                dataToExport.push([displayDate, taskDescription, subjectDescription, log.notes]);
            }
        });

        const ws = XLSX.utils.aoa_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, fileName);
    };


    // --- Initialization ---
    loadData();
    if (!userData.firstName || !userData.workplace) {
        showScreen(settingsScreen);
        userFirstNameInput.value = userData.firstName;
        userLastNameInput.value = userData.lastName;
        userPositionInput.value = userData.position;
        workplaceNameInput.value = userData.workplace;
        renderFrequentTasks();
        renderFrequentSubjects();
    } else {
        dailyLogHeader.textContent = `บันทึกประจำวัน - ${userData.firstName} ${userData.lastName}`.trim();
        renderFrequentTaskCheckboxes();
        renderFrequentSubjectCheckboxes();
        showScreen(dailyLogScreen);
        updateDailyLogView(new Date().toISOString().split('T')[0]);
    }
});