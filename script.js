// TaskMate Website - Main JavaScript File
class TaskMateApp {
    constructor() {
        this.currentUser = null;
        this.classes = [];
        this.homework = [];
        this.authStateListener = null;
        this.classesListener = null;
        this.homeworkListener = null;
        
        this.init();
    }

    async init() {
        try {
            // Set up authentication state listener
            this.setupAuthStateListener();
            
            // Set up navigation
            this.setupNavigation();
            
            // Set up form handlers
            this.setupFormHandlers();
            
            // Set up filters
            this.setupFilters();
            
            console.log('TaskMate app initialized');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize app');
        }
    }

    // Authentication Methods
    setupAuthStateListener() {
        this.authStateListener = auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                this.onUserSignedIn(user);
            } else {
                this.currentUser = null;
                this.onUserSignedOut();
            }
        });
    }

    async onUserSignedIn(user) {
        console.log('User signed in:', user.displayName);
        
        // Update UI
        document.getElementById('user-info').classList.remove('hidden');
        document.getElementById('signin-btn').classList.add('hidden');
        
        // Set user info
        document.getElementById('user-avatar').src = user.photoURL || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236B7280"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
        document.getElementById('user-name').textContent = user.displayName;
        
        // Load user data
        await this.loadUserData();
        
        // Set up real-time listeners
        this.setupRealtimeListeners();
    }

    onUserSignedOut() {
        console.log('User signed out');
        
        // Update UI
        document.getElementById('user-info').classList.add('hidden');
        document.getElementById('signin-btn').classList.remove('hidden');
        
        // Clear data
        this.classes = [];
        this.homework = [];
        
        // Remove listeners
        this.removeRealtimeListeners();
        
        // Clear UI
        this.clearUI();
        
        // Redirect to dashboard
        this.showView('dashboard');
    }

    async signIn() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
        } catch (error) {
            console.error('Sign in error:', error);
            this.showError('Failed to sign in: ' + error.message);
        }
    }

    async signOut() {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Sign out error:', error);
            this.showError('Failed to sign out: ' + error.message);
        }
    }

    // Data Loading Methods
    async loadUserData() {
        try {
            // Load classes and homework will be handled by real-time listeners
            console.log('User data loading started');
        } catch (error) {
            console.error('Failed to load user data:', error);
            this.showError('Failed to load user data');
        }
    }

    setupRealtimeListeners() {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        
        // Listen for classes changes
        this.classesListener = db.collection('users').doc(userId).collection('classes')
            .onSnapshot((snapshot) => {
                this.classes = [];
                snapshot.forEach((doc) => {
                    const classData = doc.data();
                    this.classes.push({
                        id: doc.id,
                        ...classData,
                        startTime: classData.startTime?.toDate(),
                        endTime: classData.endTime?.toDate()
                    });
                });
                this.renderClasses();
                this.updateClassFilters();
                this.renderDashboard();
            }, (error) => {
                console.error('Classes listener error:', error);
            });

        // Listen for homework changes
        this.homeworkListener = db.collection('users').doc(userId).collection('homework')
            .onSnapshot((snapshot) => {
                this.homework = [];
                snapshot.forEach((doc) => {
                    const homeworkData = doc.data();
                    this.homework.push({
                        id: doc.id,
                        ...homeworkData,
                        dueDate: homeworkData.dueDate?.toDate(),
                        createdAt: homeworkData.createdAt?.toDate()
                    });
                });
                this.renderHomework();
                this.renderDashboard();
            }, (error) => {
                console.error('Homework listener error:', error);
            });
    }

    removeRealtimeListeners() {
        if (this.classesListener) {
            this.classesListener();
            this.classesListener = null;
        }
        if (this.homeworkListener) {
            this.homeworkListener();
            this.homeworkListener = null;
        }
    }

    // Navigation Methods
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const view = button.dataset.view;
                this.showView(view);
                
                // Update active state
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show selected view
        const selectedView = document.getElementById(viewName);
        if (selectedView) {
            selectedView.classList.add('active');
        }
    }

    // Form Handlers
    setupFormHandlers() {
        // Add class form
        document.getElementById('add-class-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddClass(e.target);
        });

        // Add homework form
        document.getElementById('add-homework-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddHomework(e.target);
        });

        // Edit homework form
        document.getElementById('edit-homework-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditHomework(e.target);
        });
    }

    async handleAddClass(form) {
        if (!this.currentUser) {
            this.showError('Please sign in to add a class');
            return;
        }

        try {
            const formData = new FormData(form);
            const weekdays = formData.getAll('weekdays');
            
            if (weekdays.length === 0) {
                this.showError('Please select at least one weekday');
                return;
            }

            const classData = {
                name: formData.get('className'),
                location: formData.get('classLocation'),
                professor: formData.get('classProfessor'),
                startTime: this.parseTimeToDate(formData.get('classStartTime')),
                endTime: this.parseTimeToDate(formData.get('classEndTime')),
                color: formData.get('classColor'),
                weekdays: weekdays,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('users').doc(this.currentUser.uid).collection('classes').add(classData);
            
            this.showSuccess('Class added successfully');
            closeModal('add-class-modal');
            form.reset();
            
        } catch (error) {
            console.error('Failed to add class:', error);
            this.showError('Failed to add class: ' + error.message);
        }
    }

    async handleAddHomework(form) {
        if (!this.currentUser) {
            this.showError('Please sign in to add homework');
            return;
        }

        try {
            const formData = new FormData(form);
            
            const homeworkData = {
                title: formData.get('title'),
                description: formData.get('description'),
                classId: formData.get('classId'),
                dueDate: new Date(formData.get('dueDate')),
                priority: formData.get('priority'),
                status: 'pending',
                isCompleted: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('users').doc(this.currentUser.uid).collection('homework').add(homeworkData);
            
            this.showSuccess('Homework added successfully');
            closeModal('add-homework-modal');
            form.reset();
            
        } catch (error) {
            console.error('Failed to add homework:', error);
            this.showError('Failed to add homework: ' + error.message);
        }
    }

    async handleEditHomework(form) {
        if (!this.currentUser) {
            this.showError('Please sign in to edit homework');
            return;
        }

        try {
            const formData = new FormData(form);
            const homeworkId = formData.get('id');
            
            const homeworkData = {
                title: formData.get('title'),
                description: formData.get('description'),
                classId: formData.get('classId'),
                dueDate: new Date(formData.get('dueDate')),
                priority: formData.get('priority'),
                status: formData.get('status'),
                isCompleted: formData.get('status') === 'completed',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('users').doc(this.currentUser.uid).collection('homework').doc(homeworkId).update(homeworkData);
            
            this.showSuccess('Homework updated successfully');
            closeModal('edit-homework-modal');
            form.reset();
            
        } catch (error) {
            console.error('Failed to update homework:', error);
            this.showError('Failed to update homework: ' + error.message);
        }
    }

    // UI Rendering Methods
    renderClasses() {
        const classesGrid = document.getElementById('classes-grid');
        
        if (this.classes.length === 0) {
            classesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-graduation-cap"></i>
                    <h3>No Classes Yet</h3>
                    <p>Add your first class to get started with TaskMate</p>
                </div>
            `;
            return;
        }

        classesGrid.innerHTML = this.classes.map(classItem => `
            <div class="class-card" data-class-id="${classItem.id}">
                <div class="class-card-header">
                    <div class="class-color-indicator" style="background-color: ${classItem.color}"></div>
                    <div class="class-name">${classItem.name}</div>
                </div>
                <div class="class-details">
                    <div class="class-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${classItem.location}</span>
                    </div>
                    <div class="class-detail">
                        <i class="fas fa-user"></i>
                        <span>${classItem.professor}</span>
                    </div>
                    <div class="class-detail">
                        <i class="fas fa-clock"></i>
                        <span>${this.formatTime(classItem.startTime)} - ${this.formatTime(classItem.endTime)}</span>
                    </div>
                </div>
                <div class="class-weekdays">
                    ${classItem.weekdays.map(day => `
                        <span class="weekday-tag">${this.getWeekdayShortName(day)}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    renderHomework() {
        const homeworkList = document.getElementById('homework-list');
        const filteredHomework = this.getFilteredHomework();
        
        if (filteredHomework.length === 0) {
            homeworkList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <h3>No Homework Found</h3>
                    <p>${this.homework.length === 0 ? 'Add your first homework assignment to get started' : 'No homework matches your current filters'}</p>
                </div>
            `;
            return;
        }

        homeworkList.innerHTML = filteredHomework.map(homework => {
            const relatedClass = this.classes.find(c => c.id === homework.classId);
            const isOverdue = !homework.isCompleted && homework.dueDate < new Date();
            
            return `
                <div class="homework-item ${homework.isCompleted ? 'completed' : ''}" data-homework-id="${homework.id}">
                    <div class="homework-header">
                        <div class="homework-title-section">
                            <div class="homework-checkbox ${homework.isCompleted ? 'checked' : ''}" 
                                 onclick="app.toggleHomeworkCompletion('${homework.id}')"></div>
                            <div class="homework-title ${homework.isCompleted ? 'completed' : ''}">${homework.title}</div>
                        </div>
                        <div class="homework-actions">
                            <button class="homework-action-btn" onclick="app.editHomework('${homework.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="homework-action-btn" onclick="app.deleteHomework('${homework.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${homework.description ? `<div class="homework-description">${homework.description}</div>` : ''}
                    <div class="homework-meta">
                        ${relatedClass ? `
                            <div class="homework-meta-item">
                                <i class="fas fa-graduation-cap"></i>
                                <span>${relatedClass.name}</span>
                            </div>
                        ` : ''}
                        <div class="homework-meta-item">
                            <i class="fas fa-calendar"></i>
                            <span class="${isOverdue ? 'priority-high' : ''}">${this.formatDueDate(homework.dueDate)}</span>
                        </div>
                        <div class="homework-meta-item">
                            <i class="fas fa-flag"></i>
                            <span class="priority-${homework.priority}">${homework.priority}</span>
                        </div>
                        <div class="homework-meta-item">
                            <i class="fas fa-circle"></i>
                            <span class="status-${homework.status}">${homework.status}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderDashboard() {
        // Render upcoming homework
        this.renderUpcomingHomework();
        
        // Render recent classes
        this.renderRecentClasses();
    }

    renderUpcomingHomework() {
        const upcomingList = document.getElementById('upcoming-homework-list');
        const upcoming = this.homework
            .filter(h => !h.isCompleted && h.dueDate >= new Date())
            .sort((a, b) => a.dueDate - b.dueDate)
            .slice(0, 5);

        if (upcoming.length === 0) {
            upcomingList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>All Caught Up!</h3>
                    <p>No upcoming homework deadlines</p>
                </div>
            `;
            return;
        }

        upcomingList.innerHTML = upcoming.map(homework => {
            const relatedClass = this.classes.find(c => c.id === homework.classId);
            const daysUntilDue = Math.ceil((homework.dueDate - new Date()) / (1000 * 60 * 60 * 24));
            
            return `
                <div class="homework-item compact">
                    <div class="homework-title">${homework.title}</div>
                    <div class="homework-meta">
                        ${relatedClass ? `<span>${relatedClass.name}</span> • ` : ''}
                        <span class="priority-${homework.priority}">${homework.priority}</span> • 
                        <span>${daysUntilDue === 0 ? 'Due today' : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderRecentClasses() {
        const recentList = document.getElementById('recent-classes-list');
        const recent = this.classes.slice(0, 3);

        if (recent.length === 0) {
            recentList.innerHTML = `
                <div class="empty-container">
                    <i class="fas fa-graduation-cap"></i>
                    <h3>No Classes Yet</h3>
                    <p>Add your first class to get started</p>
                </div>
            `;
            return;
        }

        recentList.innerHTML = recent.map(classItem => `
            <div class="class-card compact">
                <div class="class-name">${classItem.name}</div>
                <div class="class-detail">
                    <i class="fas fa-clock"></i>
                    <span>${this.formatTime(classItem.startTime)} - ${this.formatTime(classItem.endTime)}</span>
                </div>
                <div class="class-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${classItem.location}</span>
                </div>
            </div>
        `).join('');
    }

    // Filter Methods
    setupFilters() {
        document.getElementById('class-filter').addEventListener('change', () => {
            this.renderHomework();
        });

        document.getElementById('status-filter').addEventListener('change', () => {
            this.renderHomework();
        });
    }

    getFilteredHomework() {
        let filtered = [...this.homework];

        // Filter by class
        const classFilter = document.getElementById('class-filter').value;
        if (classFilter) {
            filtered = filtered.filter(h => h.classId === classFilter);
        }

        // Filter by status
        const statusFilter = document.getElementById('status-filter').value;
        if (statusFilter) {
            filtered = filtered.filter(h => h.status === statusFilter);
        }

        // Sort by due date (earliest first)
        filtered.sort((a, b) => a.dueDate - b.dueDate);

        return filtered;
    }

    updateClassFilters() {
        const classFilter = document.getElementById('class-filter');
        const editClassFilter = document.getElementById('edit-homework-class');
        
        const options = this.classes.map(classItem => 
            `<option value="${classItem.id}">${classItem.name}</option>`
        );

        const defaultOption = '<option value="">All Classes</option>';
        const selectOption = '<option value="">Select a class</option>';

        classFilter.innerHTML = defaultOption + options.join('');
        editClassFilter.innerHTML = selectOption + options.join('');
        
        // Also update the add homework form
        const addHomeworkClass = document.getElementById('homework-class');
        if (addHomeworkClass) {
            addHomeworkClass.innerHTML = selectOption + options.join('');
        }
    }

    // Homework Management Methods
    async toggleHomeworkCompletion(homeworkId) {
        if (!this.currentUser) return;

        try {
            const homework = this.homework.find(h => h.id === homeworkId);
            if (!homework) return;

            const newStatus = homework.isCompleted ? 'pending' : 'completed';
            
            await db.collection('users').doc(this.currentUser.uid).collection('homework').doc(homeworkId).update({
                isCompleted: !homework.isCompleted,
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        } catch (error) {
            console.error('Failed to toggle homework completion:', error);
            this.showError('Failed to update homework');
        }
    }

    editHomework(homeworkId) {
        const homework = this.homework.find(h => h.id === homeworkId);
        if (!homework) return;

        // Populate form
        document.getElementById('edit-homework-id').value = homework.id;
        document.getElementById('edit-homework-title').value = homework.title;
        document.getElementById('edit-homework-description').value = homework.description || '';
        document.getElementById('edit-homework-class').value = homework.classId;
        document.getElementById('edit-homework-due-date').value = this.formatDateForInput(homework.dueDate);
        document.getElementById('edit-homework-priority').value = homework.priority;
        document.getElementById('edit-homework-status').value = homework.status;

        // Show modal
        showModal('edit-homework-modal');
    }

    async deleteHomework(homeworkId) {
        if (!this.currentUser) return;

        if (!confirm('Are you sure you want to delete this homework assignment?')) {
            return;
        }

        try {
            await db.collection('users').doc(this.currentUser.uid).collection('homework').doc(homeworkId).delete();
            this.showSuccess('Homework deleted successfully');
        } catch (error) {
            console.error('Failed to delete homework:', error);
            this.showError('Failed to delete homework');
        }
    }

    // Utility Methods
    parseTimeToDate(timeString) {
        if (!timeString) return null;
        
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return date;
    }

    formatTime(date) {
        if (!date) return '';
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    formatDateForInput(date) {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    }

    formatDueDate(date) {
        if (!date) return '';
        
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return 'Overdue';
        } else if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Tomorrow';
        } else if (diffDays <= 7) {
            return date.toLocaleDateString('en-US', { weekday: 'long' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    getWeekdayShortName(weekday) {
        const weekdays = {
            'monday': 'Mon',
            'tuesday': 'Tue',
            'wednesday': 'Wed',
            'thursday': 'Thu',
            'friday': 'Fri',
            'saturday': 'Sat',
            'sunday': 'Sun'
        };
        return weekdays[weekday] || weekday;
    }

    clearUI() {
        document.getElementById('classes-grid').innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading classes...</p></div>';
        document.getElementById('homework-list').innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading homework...</p></div>';
        document.getElementById('upcoming-homework-list').innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading...</p></div>';
        document.getElementById('recent-classes-list').innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading...</p></div>';
    }

    showSuccess(message) {
        // Simple success notification - you can enhance this with a proper toast library
        alert('✅ ' + message);
    }

    showError(message) {
        // Simple error notification - you can enhance this with a proper toast library
        alert('❌ ' + message);
    }
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Global functions for onclick handlers
function showAddClassModal() {
    showModal('add-class-modal');
}

function showAddHomeworkModal() {
    showModal('add-homework-modal');
}

function signIn() {
    app.signIn();
}

function signOut() {
    app.signOut();
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TaskMateApp();
});

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});
