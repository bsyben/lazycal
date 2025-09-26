// Task Management Application
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('lazycal-tasks')) || [];
        this.settings = JSON.parse(localStorage.getItem('lazycal-settings')) || {
            reminderTime: '17:00'
        };
        this.currentView = 'task-list';
        this.currentDate = new Date();
        this.calendarMode = 'week';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCurrentView();
        this.setupDailyReminder();
        this.checkOverdueTasks();
    }

    // Task Model and Data Management
    createTask(taskData) {
        const task = {
            id: Date.now().toString(),
            name: taskData.name,
            totalWorkload: parseInt(taskData.totalWorkload),
            remainingWorkload: parseInt(taskData.totalWorkload),
            unit: taskData.unit === 'custom' ? taskData.customUnit : taskData.unit,
            startDate: new Date(taskData.startDate),
            dueDate: new Date(taskData.dueDate),
            priority: parseInt(taskData.priority),
            procrastinationCoeff: parseFloat(taskData.procrastination),
            status: 'active', // active, completed, overdue
            dailyProgress: {},
            createdAt: new Date(),
            dailyWorkload: 0,
            adjustedDailyWorkload: 0
        };

        // Calculate daily workload
        this.calculateDailyWorkload(task);
        
        this.tasks.push(task);
        this.saveTasks();
        return task;
    }

    calculateDailyWorkload(task) {
        const startDate = new Date(task.startDate);
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - startDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff <= 0) {
            task.dailyWorkload = task.totalWorkload;
            task.adjustedDailyWorkload = task.totalWorkload;
            return;
        }

        // Calculate average daily workload (rounded up)
        task.dailyWorkload = Math.ceil(task.totalWorkload / daysDiff);
        
        // Adjust for procrastination coefficient (rounded down)
        task.adjustedDailyWorkload = Math.floor(
            task.dailyWorkload * (1 + task.procrastinationCoeff)
        );
    }

    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            Object.assign(this.tasks[taskIndex], updates);
            if (updates.totalWorkload || updates.startDate || updates.dueDate || updates.procrastinationCoeff) {
                this.calculateDailyWorkload(this.tasks[taskIndex]);
            }
            this.saveTasks();
            return this.tasks[taskIndex];
        }
        return null;
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
    }

    updateTaskProgress(taskId, completedWorkload, date = new Date()) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;

        const dateKey = this.formatDate(date);
        task.dailyProgress[dateKey] = completedWorkload;
        task.remainingWorkload = Math.max(0, task.remainingWorkload - completedWorkload);

        if (task.remainingWorkload <= 0) {
            task.status = 'completed';
            task.remainingWorkload = 0;
            task.completedAt = new Date();
        }

        this.saveTasks();
        return true;
    }

    checkOverdueTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.tasks.forEach(task => {
            if (task.status === 'active' && new Date(task.dueDate) < today && task.remainingWorkload > 0) {
                task.status = 'overdue';
            }
        });

        this.saveTasks();
    }

    // View Management
    switchView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        document.getElementById(`${viewName}-view`).classList.add('active');

        // Update view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        this.currentView = viewName;
        this.renderCurrentView();
    }

    renderCurrentView() {
        switch (this.currentView) {
            case 'task-list':
                this.renderTaskList();
                break;
            case 'calendar':
                this.renderCalendar();
                break;
            case 'daily':
                this.renderDailyPanel();
                break;
            case 'archive':
                this.renderArchive();
                break;
        }
    }

    // Task List View
    renderTaskList() {
        const container = document.getElementById('task-list');
        const activeTasks = this.tasks.filter(t => t.status === 'active');

        if (activeTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h3>No tasks yet</h3>
                    <p>Click "Add Task" to create your first task</p>
                </div>
            `;
            return;
        }

        // Sort by priority (highest first), then by due date
        activeTasks.sort((a, b) => {
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            return new Date(a.dueDate) - new Date(b.dueDate);
        });

        container.innerHTML = activeTasks.map(task => this.createTaskHTML(task)).join('');
    }

    createTaskHTML(task) {
        const progress = ((task.totalWorkload - task.remainingWorkload) / task.totalWorkload) * 100;
        const priorityText = ['', 'Lowest', 'Low', 'Medium', 'High', 'Highest'][task.priority];
        
        return `
            <div class="task-item priority-${task.priority}" data-task-id="${task.id}">
                <div class="task-header">
                    <div>
                        <div class="task-title">${task.name}</div>
                        <div class="task-priority">Priority: ${priorityText}</div>
                    </div>
                    <div class="task-actions">
                        <button class="btn btn-secondary edit-task-btn" data-task-id="${task.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger delete-task-btn" data-task-id="${task.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                
                <div class="task-details">
                    <div class="task-detail">
                        <div class="task-detail-label">Workload</div>
                        <div class="task-detail-value">${task.remainingWorkload}/${task.totalWorkload} ${task.unit}</div>
                    </div>
                    <div class="task-detail">
                        <div class="task-detail-label">Start Date</div>
                        <div class="task-detail-value">${this.formatDateTime(task.startDate)}</div>
                    </div>
                    <div class="task-detail">
                        <div class="task-detail-label">Due Date</div>
                        <div class="task-detail-value">${this.formatDateTime(task.dueDate)}</div>
                    </div>
                    <div class="task-detail">
                        <div class="task-detail-label">Daily Workload</div>
                        <div class="task-detail-value">${task.adjustedDailyWorkload} ${task.unit}/day</div>
                    </div>
                </div>

                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }

    // Calendar View
    renderCalendar() {
        const container = document.getElementById('calendar-container');
        const periodElement = document.getElementById('current-period');

        if (this.calendarMode === 'week') {
            this.renderWeekView(container, periodElement);
        } else {
            this.renderMonthView(container, periodElement);
        }
    }

    renderWeekView(container, periodElement) {
        const startOfWeek = this.getStartOfWeek(this.currentDate);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);

        periodElement.textContent = `${this.formatDate(startOfWeek)} - ${this.formatDate(endOfWeek)}`;

        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            weekDays.push(day);
        }

        container.innerHTML = `
            <div class="calendar-grid">
                ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => 
                    `<div class="calendar-header">${day}</div>`
                ).join('')}
                ${weekDays.map(day => this.createCalendarDayHTML(day)).join('')}
            </div>
        `;
    }

    renderMonthView(container, periodElement) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        periodElement.textContent = `${this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = this.getStartOfWeek(firstDay);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 41); // 6 weeks

        const days = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
        }

        container.innerHTML = `
            <div class="calendar-grid">
                ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => 
                    `<div class="calendar-header">${day}</div>`
                ).join('')}
                ${days.map(day => this.createCalendarDayHTML(day, month)).join('')}
            </div>
        `;
    }

    createCalendarDayHTML(date, currentMonth = null) {
        const today = new Date();
        const isToday = this.isSameDay(date, today);
        const isOtherMonth = currentMonth !== null && date.getMonth() !== currentMonth;
        
        const dayTasks = this.getTasksForDate(date);
        
        return `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isOtherMonth ? 'other-month' : ''}">
                <div class="day-number">${date.getDate()}</div>
                ${dayTasks.map(task => `
                    <div class="calendar-task priority-${task.priority}" title="${task.name}">
                        ${task.name} (${task.adjustedDailyWorkload} ${task.unit})
                    </div>
                `).join('')}
            </div>
        `;
    }

    getTasksForDate(date) {
        return this.tasks
            .filter(task => {
                if (task.status !== 'active') return false;
                const taskStart = new Date(task.startDate);
                const taskEnd = new Date(task.dueDate);
                taskStart.setHours(0, 0, 0, 0);
                taskEnd.setHours(23, 59, 59, 999);
                return date >= taskStart && date <= taskEnd;
            })
            .sort((a, b) => b.priority - a.priority);
    }

    // Daily Panel View
    renderDailyPanel() {
        const container = document.getElementById('daily-tasks');
        const dateElement = document.getElementById('current-date');
        
        const today = new Date();
        dateElement.textContent = today.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const todayTasks = this.getTasksForDate(today);

        if (todayTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-day"></i>
                    <h3>No tasks for today</h3>
                    <p>Enjoy your free day!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = todayTasks.map(task => this.createDailyTaskHTML(task)).join('');
    }

    createDailyTaskHTML(task) {
        const today = this.formatDate(new Date());
        const todayProgress = task.dailyProgress[today] || 0;
        
        return `
            <div class="daily-task priority-${task.priority}">
                <div class="task-header">
                    <div class="task-title">${task.name}</div>
                    <div class="task-priority">Priority ${task.priority}</div>
                </div>
                
                <div class="daily-workload">
                    <div class="workload-info">
                        <span class="workload-label">Today's Target:</span>
                        <span class="workload-value">${task.adjustedDailyWorkload} ${task.unit}</span>
                    </div>
                    <div class="workload-info">
                        <span class="workload-label">Completed Today:</span>
                        <span class="workload-value">${todayProgress} ${task.unit}</span>
                    </div>
                    <div class="workload-info">
                        <span class="workload-label">Remaining Total:</span>
                        <span class="workload-value">${task.remainingWorkload} ${task.unit}</span>
                    </div>
                </div>

                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(100, (todayProgress / task.adjustedDailyWorkload) * 100)}%"></div>
                </div>
            </div>
        `;
    }

    // Archive View
    renderArchive() {
        const container = document.getElementById('archive-tasks');
        const archivedTasks = this.tasks.filter(t => t.status === 'completed' || t.status === 'overdue');
        
        // Get current filter
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        let filteredTasks = archivedTasks;
        
        if (activeFilter === 'completed') {
            filteredTasks = archivedTasks.filter(t => t.status === 'completed');
        } else if (activeFilter === 'overdue') {
            filteredTasks = archivedTasks.filter(t => t.status === 'overdue');
        }

        if (filteredTasks.length === 0) {
            const filterText = activeFilter === 'all' ? 'archived' : activeFilter;
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-archive"></i>
                    <h3>No ${filterText} tasks</h3>
                    <p>${activeFilter === 'all' ? 'Complete or miss some tasks to see them here' : `No ${filterText} tasks found`}</p>
                </div>
            `;
            return;
        }

        // Sort by completion/due date (most recent first)
        filteredTasks.sort((a, b) => {
            const dateA = a.status === 'completed' ? new Date(a.completedAt || a.dueDate) : new Date(a.dueDate);
            const dateB = b.status === 'completed' ? new Date(b.completedAt || b.dueDate) : new Date(b.dueDate);
            return dateB - dateA;
        });

        container.innerHTML = filteredTasks.map(task => this.createArchivedTaskHTML(task)).join('');
    }

    createArchivedTaskHTML(task) {
        const progress = ((task.totalWorkload - task.remainingWorkload) / task.totalWorkload) * 100;
        const priorityText = ['', 'Lowest', 'Low', 'Medium', 'High', 'Highest'][task.priority];
        const statusText = task.status === 'completed' ? 'Completed' : 'Overdue';
        const statusIcon = task.status === 'completed' ? 'fa-check-circle' : 'fa-exclamation-triangle';
        
        return `
            <div class="task-item archived-task ${task.status} priority-${task.priority}" data-task-id="${task.id}">
                <div class="task-header">
                    <div>
                        <div class="task-title">${task.name}</div>
                        <div class="task-status-info">
                            <span class="task-priority">Priority: ${priorityText}</span>
                            <span class="task-status ${task.status}">
                                <i class="fas ${statusIcon}"></i> ${statusText}
                            </span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="btn btn-secondary restore-task-btn" data-task-id="${task.id}">
                            <i class="fas fa-undo"></i> Restore
                        </button>
                        <button class="btn btn-danger delete-archived-task-btn" data-task-id="${task.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                
                <div class="task-details">
                    <div class="task-detail">
                        <div class="task-detail-label">Final Workload</div>
                        <div class="task-detail-value">${task.totalWorkload - task.remainingWorkload}/${task.totalWorkload} ${task.unit}</div>
                    </div>
                    <div class="task-detail">
                        <div class="task-detail-label">Start Date</div>
                        <div class="task-detail-value">${this.formatDateTime(task.startDate)}</div>
                    </div>
                    <div class="task-detail">
                        <div class="task-detail-label">Due Date</div>
                        <div class="task-detail-value">${this.formatDateTime(task.dueDate)}</div>
                    </div>
                    <div class="task-detail">
                        <div class="task-detail-label">${task.status === 'completed' ? 'Completed' : 'Status'}</div>
                        <div class="task-detail-value">${task.status === 'completed' ? this.formatDateTime(task.completedAt || task.dueDate) : 'Incomplete'}</div>
                    </div>
                </div>

                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }

    // Event Listeners
    setupEventListeners() {
        // View switching
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.closest('.view-btn').dataset.view);
            });
        });

        // Add task button
        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.showTaskModal();
        });

        // Task form
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskSubmit();
        });

        // Modal controls
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Cancel buttons
        document.getElementById('cancel-btn').addEventListener('click', () => {
            document.getElementById('task-modal').classList.remove('active');
        });

        document.getElementById('cancel-progress-btn').addEventListener('click', () => {
            document.getElementById('progress-modal').classList.remove('active');
        });

        document.getElementById('cancel-settings-btn').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.remove('active');
        });

        // Custom unit handling
        document.getElementById('workload-unit').addEventListener('change', (e) => {
            const customInput = document.getElementById('custom-unit');
            if (e.target.value === 'custom') {
                customInput.style.display = 'block';
                customInput.required = true;
            } else {
                customInput.style.display = 'none';
                customInput.required = false;
            }
        });

        // Calendar controls
        document.getElementById('prev-period').addEventListener('click', () => {
            this.navigateCalendar(-1);
        });

        document.getElementById('next-period').addEventListener('click', () => {
            this.navigateCalendar(1);
        });

        document.getElementById('calendar-mode').addEventListener('change', (e) => {
            this.calendarMode = e.target.value;
            this.renderCalendar();
        });

        // Progress tracking
        document.getElementById('track-progress-btn').addEventListener('click', () => {
            this.showProgressModal();
        });

        document.getElementById('save-progress-btn').addEventListener('click', () => {
            this.handleProgressSubmit();
        });

        // Settings
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettingsModal();
        });

        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.handleSettingsSubmit();
        });

        // Archive filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.filter-btn').classList.add('active');
                if (this.currentView === 'archive') {
                    this.renderArchive();
                }
            });
        });

        // Clear archive button
        document.getElementById('clear-archive-btn').addEventListener('click', () => {
            this.clearArchive();
        });

        // Task actions (using event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-task-btn')) {
                const taskId = e.target.closest('.edit-task-btn').dataset.taskId;
                this.editTask(taskId);
            } else if (e.target.closest('.delete-task-btn')) {
                const taskId = e.target.closest('.delete-task-btn').dataset.taskId;
                this.confirmDeleteTask(taskId);
            } else if (e.target.closest('.restore-task-btn')) {
                const taskId = e.target.closest('.restore-task-btn').dataset.taskId;
                this.restoreTask(taskId);
            } else if (e.target.closest('.delete-archived-task-btn')) {
                const taskId = e.target.closest('.delete-archived-task-btn').dataset.taskId;
                this.confirmDeleteArchivedTask(taskId);
            }
        });
    }

    // Modal Management
    showTaskModal(task = null) {
        const modal = document.getElementById('task-modal');
        const form = document.getElementById('task-form');
        const title = document.getElementById('modal-title');

        if (task) {
            title.textContent = 'Edit Task';
            this.populateTaskForm(task);
        } else {
            title.textContent = 'Add New Task';
            form.reset();
            document.getElementById('procrastination').value = '0.5';
            
            // Set default dates
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            document.getElementById('start-date').value = this.formatDateTimeInput(now);
            document.getElementById('due-date').value = this.formatDateTimeInput(tomorrow);
        }

        modal.classList.add('active');
    }

    populateTaskForm(task) {
        document.getElementById('task-name').value = task.name;
        document.getElementById('total-workload').value = task.totalWorkload;
        document.getElementById('start-date').value = this.formatDateTimeInput(task.startDate);
        document.getElementById('due-date').value = this.formatDateTimeInput(task.dueDate);
        document.getElementById('priority').value = task.priority;
        document.getElementById('procrastination').value = task.procrastinationCoeff;

        const unitSelect = document.getElementById('workload-unit');
        const customInput = document.getElementById('custom-unit');
        
        const standardUnits = ['pages', 'points', 'hours', 'items', 'chapters', 'exercises'];
        if (standardUnits.includes(task.unit)) {
            unitSelect.value = task.unit;
            customInput.style.display = 'none';
        } else {
            unitSelect.value = 'custom';
            customInput.value = task.unit;
            customInput.style.display = 'block';
        }
    }

    handleTaskSubmit() {
        const formData = new FormData(document.getElementById('task-form'));
        const taskData = {
            name: formData.get('task-name') || document.getElementById('task-name').value,
            totalWorkload: document.getElementById('total-workload').value,
            unit: document.getElementById('workload-unit').value,
            customUnit: document.getElementById('custom-unit').value,
            startDate: document.getElementById('start-date').value,
            dueDate: document.getElementById('due-date').value,
            priority: document.getElementById('priority').value,
            procrastination: document.getElementById('procrastination').value
        };

        // Validation
        if (!taskData.name || !taskData.totalWorkload || !taskData.startDate || !taskData.dueDate) {
            alert('Please fill in all required fields.');
            return;
        }

        if (new Date(taskData.startDate) >= new Date(taskData.dueDate)) {
            alert('Due date must be after start date.');
            return;
        }

        const editingTaskId = document.getElementById('task-form').dataset.editingId;
        
        if (editingTaskId) {
            this.updateTask(editingTaskId, taskData);
            delete document.getElementById('task-form').dataset.editingId;
        } else {
            this.createTask(taskData);
        }

        document.getElementById('task-modal').classList.remove('active');
        this.renderCurrentView();
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            document.getElementById('task-form').dataset.editingId = taskId;
            this.showTaskModal(task);
        }
    }

    confirmDeleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.deleteTask(taskId);
            this.renderCurrentView();
        }
    }

    showProgressModal() {
        const modal = document.getElementById('progress-modal');
        const container = document.getElementById('progress-form-container');
        
        const today = new Date();
        const todayTasks = this.getTasksForDate(today);

        if (todayTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-day"></i>
                    <h3>No tasks for today</h3>
                    <p>Nothing to track!</p>
                </div>
            `;
        } else {
            container.innerHTML = todayTasks.map(task => this.createProgressItemHTML(task)).join('');
        }

        modal.classList.add('active');
    }

    createProgressItemHTML(task) {
        const today = this.formatDate(new Date());
        const todayProgress = task.dailyProgress[today] || 0;
        
        return `
            <div class="progress-item" data-task-id="${task.id}">
                <div class="progress-item-header">
                    <span class="progress-task-name">${task.name}</span>
                    <span class="task-priority">Priority ${task.priority}</span>
                </div>
                <div class="progress-input">
                    <label>Completed today:</label>
                    <input type="number" min="0" max="${task.remainingWorkload}" 
                           value="${todayProgress}" class="progress-value">
                    <span>${task.unit}</span>
                    <small>(Target: ${task.adjustedDailyWorkload} ${task.unit})</small>
                </div>
            </div>
        `;
    }

    handleProgressSubmit() {
        const progressItems = document.querySelectorAll('.progress-item');
        const today = new Date();

        progressItems.forEach(item => {
            const taskId = item.dataset.taskId;
            const completedWorkload = parseInt(item.querySelector('.progress-value').value) || 0;
            this.updateTaskProgress(taskId, completedWorkload, today);
        });

        document.getElementById('progress-modal').classList.remove('active');
        this.renderCurrentView();
        this.checkOverdueTasks();
    }

    showSettingsModal() {
        const modal = document.getElementById('settings-modal');
        document.getElementById('reminder-time').value = this.settings.reminderTime;
        modal.classList.add('active');
    }

    handleSettingsSubmit() {
        this.settings.reminderTime = document.getElementById('reminder-time').value;
        this.saveSettings();
        this.setupDailyReminder();
        document.getElementById('settings-modal').classList.remove('active');
    }

    // Archive Management Methods
    restoreTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && (task.status === 'completed' || task.status === 'overdue')) {
            task.status = 'active';
            if (task.completedAt) {
                delete task.completedAt;
            }
            // Reset remaining workload if it was completed
            if (task.remainingWorkload === 0 && task.status === 'active') {
                task.remainingWorkload = 1; // Give it at least 1 unit to work with
            }
            this.saveTasks();
            this.renderCurrentView();
        }
    }

    clearArchive() {
        if (confirm('Are you sure you want to permanently delete all archived tasks? This action cannot be undone.')) {
            this.tasks = this.tasks.filter(t => t.status === 'active');
            this.saveTasks();
            this.renderCurrentView();
        }
    }

    confirmDeleteArchivedTask(taskId) {
        if (confirm('Are you sure you want to permanently delete this archived task?')) {
            this.deleteTask(taskId);
            this.renderCurrentView();
        }
    }

    // Calendar Navigation
    navigateCalendar(direction) {
        if (this.calendarMode === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        } else {
            this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        }
        this.renderCalendar();
    }

    // Daily Reminder System
    setupDailyReminder() {
        // Clear existing reminder
        if (this.reminderInterval) {
            clearInterval(this.reminderInterval);
        }

        // Check every minute if it's reminder time
        this.reminderInterval = setInterval(() => {
            const now = new Date();
            const reminderTime = this.settings.reminderTime.split(':');
            const reminderHour = parseInt(reminderTime[0]);
            const reminderMinute = parseInt(reminderTime[1]);

            if (now.getHours() === reminderHour && now.getMinutes() === reminderMinute) {
                this.showDailyReminder();
            }
        }, 60000); // Check every minute
    }

    showDailyReminder() {
        const today = new Date();
        const todayTasks = this.getTasksForDate(today);
        
        if (todayTasks.length > 0) {
            if (confirm(`It's ${this.settings.reminderTime}! Time to track your daily progress. Would you like to update your task progress now?`)) {
                this.showProgressModal();
            }
        }
    }

    // Utility Functions
    formatDate(date) {
        return date.toLocaleDateString('en-US');
    }

    formatDateTime(date) {
        return date.toLocaleString('en-US');
    }

    formatDateTimeInput(date) {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    }

    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }

    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }

    // Data Persistence
    saveTasks() {
        localStorage.setItem('lazycal-tasks', JSON.stringify(this.tasks));
    }

    saveSettings() {
        localStorage.setItem('lazycal-settings', JSON.stringify(this.settings));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});