document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskModal = document.getElementById('taskModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('task-list');
    const modalTitle = document.getElementById('modalTitle');
    const taskCountEl = document.getElementById('task-count');
    const filters = document.querySelectorAll('.filters li');
    const categories = document.querySelectorAll('.categories li');
    const sortBySelect = document.getElementById('sort-by');

    // --- APP STATE ---
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [
        { id: 1, title: "Design the new landing page", dueDate: "2025-10-15", category: "work", priority: "high", completed: false },
        { id: 2, title: "Buy groceries for the week", dueDate: "2025-10-04", category: "shopping", priority: "medium", completed: false },
        { id: 3, title: "Schedule a dentist appointment", dueDate: "2025-10-10", category: "personal", priority: "low", completed: true }
    ];
    let isEditing = false;
    let currentTaskId = null;
    let currentFilter = 'all';
    let currentCategory = 'all';
    let currentSort = 'date';

    // --- FUNCTIONS ---

    // Save tasks to local storage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Render tasks to the DOM
    const renderTasks = () => {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;

        // Filter by completion status
        if (currentFilter === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        }

        // Filter by category
        if (currentCategory !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.category === currentCategory);
        }

        // Sort tasks
        filteredTasks.sort((a, b) => {
            if (currentSort === 'priority') {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            } else { // Sort by date
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
        });

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<p style="text-align: center; color: var(--text-secondary);">No tasks found. Time to relax! 🌴</p>`;
        } else {
            filteredTasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.classList.add('task-item');
                if (task.completed) taskElement.classList.add('completed');
                taskElement.classList.add(`priority-${task.priority}`);
                taskElement.dataset.id = task.id;

                taskElement.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <div class="task-details">
                        <p class="task-title">${task.title}</p>
                        <div class="task-info">
                            <span><i class="fa-regular fa-calendar"></i> ${task.dueDate}</span>
                            <span class="task-category-tag">${task.category}</span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
                        <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                taskList.appendChild(taskElement);
            });
        }
        updateTaskCount();
    };

    const updateTaskCount = () => {
        const pendingTasks = tasks.filter(task => !task.completed).length;
        taskCountEl.textContent = pendingTasks;
    };

    // Show/Hide Modal
    const showModal = () => taskModal.classList.add('active');
    const hideModal = () => taskModal.classList.remove('active');

    // Open Add Task Modal
    const openAddTaskModal = () => {
        isEditing = false;
        taskForm.reset();
        modalTitle.textContent = "Add New Task";
        document.querySelector('.btn-save').textContent = "Save Task";
        document.getElementById('taskId').value = '';
        showModal();
    };

    // Open Edit Task Modal
    const openEditTaskModal = (task) => {
        isEditing = true;
        currentTaskId = task.id;
        modalTitle.textContent = "Edit Task";
        document.querySelector('.btn-save').textContent = "Update Task";
        
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDueDate').value = task.dueDate;
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskPriority').value = task.priority;
        
        showModal();
    };

    // Handle Form Submission
    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        const title = document.getElementById('taskTitle').value.trim();
        const dueDate = document.getElementById('taskDueDate').value;
        const category = document.getElementById('taskCategory').value;
        const priority = document.getElementById('taskPriority').value;

        if (!title || !dueDate) return;

        if (isEditing) {
            // Update existing task
            tasks = tasks.map(task => 
                task.id === currentTaskId 
                ? { ...task, title, dueDate, category, priority } 
                : task
            );
        } else {
            // Add new task
            const newTask = {
                id: Date.now(),
                title,
                dueDate,
                category,
                priority,
                completed: false
            };
            tasks.push(newTask);
        }

        saveTasks();
        renderTasks();
        hideModal();
    };
    
    // Handle actions on task list (delegation)
    const handleTaskListClick = (e) => {
        const target = e.target;
        const taskItem = target.closest('.task-item');
        if (!taskItem) return;
        const taskId = Number(taskItem.dataset.id);

        // Toggle complete
        if (target.classList.contains('task-checkbox')) {
            const task = tasks.find(t => t.id === taskId);
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }

        // Delete task
        if (target.closest('.delete-btn')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
        }

        // Edit task
        if (target.closest('.edit-btn')) {
            const task = tasks.find(t => t.id === taskId);
            openEditTaskModal(task);
        }
    };
    
    // --- EVENT LISTENERS ---
    addTaskBtn.addEventListener('click', openAddTaskModal);
    cancelBtn.addEventListener('click', hideModal);
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) hideModal();
    });
    taskForm.addEventListener('submit', handleFormSubmit);
    taskList.addEventListener('click', handleTaskListClick);

    // Filter Listeners
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            filters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            currentFilter = filter.dataset.filter;
            renderTasks();
        });
    });

    // Category Listeners
    categories.forEach(category => {
        category.addEventListener('click', () => {
            categories.forEach(c => c.classList.remove('active'));
            category.classList.add('active');
            currentCategory = category.dataset.category;
            renderTasks();
        });
    });

    // Sort Listener
    sortBySelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTasks();
    });

    // --- INITIAL RENDER ---
    renderTasks();
});