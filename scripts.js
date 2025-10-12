// Frontend mein API calls update karein
const API_BASE = "https://your-backend.onrender.com/api";

// Example:
fetch(`${API_BASE}/jobs`)
    .then(response => response.json())
    .then(data => console.log(data));
    
// Pakistan Job Portal - Main JavaScript
class PakJobsPortal {
    constructor() {
        this.API_BASE_URL = 'http://localhost:3000/api';
        this.currentUser = null;
        this.authToken = null;
        this.jobs = [];
        this.currentPage = 1;
        this.jobsPerPage = 6;
        this.isLoading = false;

        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.checkAuthentication();
        this.loadInitialData();
        this.setupMobileMenu();
    }

    setupEventListeners() {
        // Mobile Menu
        document.querySelector('.mobile-menu')?.addEventListener('click', () => this.toggleMobileMenu());

        // Auth Modals
        document.getElementById('loginBtn')?.addEventListener('click', () => this.showModal('loginModal'));
        document.getElementById('registerBtn')?.addEventListener('click', () => this.showModal('registerModal'));
        document.getElementById('closeLoginModal')?.addEventListener('click', () => this.hideModal('loginModal'));
        document.getElementById('closeRegisterModal')?.addEventListener('click', () => this.hideModal('registerModal'));
        document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('loginModal');
            this.showModal('registerModal');
        });
        document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('registerModal');
            this.showModal('loginModal');
        });

        // Forms
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));

        // Job Search
        document.getElementById('searchBtn')?.addEventListener('click', () => this.handleSearch());
        document.getElementById('clearFilters')?.addEventListener('click', () => this.clearAllFilters());

        // Filters
        ['categoryFilter', 'cityFilter', 'experienceFilter', 'salaryFilter'].forEach(filter => {
            document.getElementById(filter)?.addEventListener('change', () => this.filterJobs());
        });

        // Popular search tags
        document.querySelectorAll('.popular-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                document.getElementById('jobSearch').value = e.target.dataset.search;
                this.handleSearch();
            });
        });

        // Load More
        document.getElementById('loadMoreJobs')?.addEventListener('click', () => this.loadMoreJobs());

        // Post Job
        document.getElementById('postJobBtn')?.addEventListener('click', () => this.showPostJobModal());

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    this.hideModal(modal.id);
                });
            }
        });
    }

    setupMobileMenu() {
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                document.querySelector('.nav-menu').classList.remove('active');
                this.updateMobileMenuIcon();
            });
        });

        document.addEventListener('click', (e) => {
            const navMenu = document.querySelector('.nav-menu');
            const mobileMenu = document.querySelector('.mobile-menu');
            if (!navMenu.contains(e.target) && !mobileMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                this.updateMobileMenuIcon();
            }
        });
    }

    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        navMenu.classList.toggle('active');
        this.updateMobileMenuIcon();
    }

    updateMobileMenuIcon() {
        const icon = document.querySelector('.mobile-menu i');
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    }

    checkAuthentication() {
        const savedUser = localStorage.getItem('pakjobs_user');
        const savedToken = localStorage.getItem('pakjobs_token');

        if (savedUser && savedToken) {
            this.currentUser = JSON.parse(savedUser);
            this.authToken = savedToken;
            this.updateUIForLoggedInUser();
        }
    }

    async loadInitialData() {
        try {
            await this.loadJobs();
            this.animateStats();
        } catch (error) {
            this.loadSampleData();
        }
    }

    async loadJobs() {
        try {
            const data = await this.apiCall('/jobs');
            this.jobs = data.jobs || [];
            this.displayJobs(this.getPaginatedJobs());
        } catch (error) {
            this.loadSampleData();
        }
    }

    loadSampleData() {
        // Sample job data for Pakistan
        this.jobs = [
            {
                id: '1',
                title: 'Senior Software Engineer',
                company: 'Systems Limited',
                type: 'Full-time',
                location: 'Karachi',
                salary: '150,000 - 250,000 PKR',
                category: 'IT & Software',
                experience: '3-5 years',
                description: 'We are looking for a Senior Software Engineer with experience in .NET and Angular to join our team in Karachi.',
                postedAt: new Date().toISOString(),
                isUrgent: true
            },
            {
                id: '2',
                title: 'Marketing Manager',
                company: 'Engro Corporation',
                type: 'Full-time',
                location: 'Karachi',
                salary: '120,000 - 200,000 PKR',
                category: 'Business & Marketing',
                experience: '5+ years',
                description: 'Lead marketing initiatives for one of Pakistan\'s leading corporations.',
                postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '3',
                title: 'Secondary School Teacher',
                company: 'Punjab Education Department',
                type: 'Full-time',
                location: 'Lahore',
                salary: '60,000 - 90,000 PKR',
                category: 'Education',
                experience: '2-3 years',
                description: 'Government teaching position for secondary school in Lahore.',
                postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '4',
                title: 'Staff Nurse',
                company: 'Aga Khan Hospital',
                type: 'Full-time',
                location: 'Karachi',
                salary: '45,000 - 70,000 PKR',
                category: 'Healthcare',
                experience: '1-2 years',
                description: 'Registered nurse position at premier healthcare institution.',
                postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '5',
                title: 'Accountant',
                company: 'UBL',
                type: 'Full-time',
                location: 'Islamabad',
                salary: '80,000 - 120,000 PKR',
                category: 'Finance',
                experience: '2-4 years',
                description: 'Accounting position at leading Pakistani bank.',
                postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '6',
                title: 'Frontend Developer',
                company: 'Techlogix',
                type: 'Full-time',
                location: 'Lahore',
                salary: '100,000 - 180,000 PKR',
                category: 'IT & Software',
                experience: '2-3 years',
                description: 'React.js developer needed for international projects.',
                postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        this.displayJobs(this.getPaginatedJobs());
    }

    getPaginatedJobs() {
        const startIndex = (this.currentPage - 1) * this.jobsPerPage;
        const endIndex = startIndex + this.jobsPerPage;
        return this.jobs.slice(0, endIndex);
    }

    displayJobs(jobsToDisplay) {
        const jobListings = document.getElementById('jobListings');
        if (!jobListings) return;

        if (this.currentPage === 1) {
            jobListings.innerHTML = '';
        }

        if (jobsToDisplay.length === 0) {
            jobListings.innerHTML = `
                <div class="no-jobs" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-search fa-3x" style="color: #01411C; margin-bottom: 1rem;"></i>
                    <h3 style="margin-bottom: 1rem;">No jobs found</h3>
                    <p style="color: #666;">Try adjusting your search criteria or browse all jobs</p>
                </div>
            `;
            document.getElementById('loadMoreJobs').style.display = 'none';
            return;
        }

        jobsToDisplay.forEach(job => {
            const jobCard = this.createJobCard(job);
            jobListings.appendChild(jobCard);
        });

        document.getElementById('loadMoreJobs').style.display =
            jobsToDisplay.length < this.jobs.length ? 'block' : 'none';
    }

    createJobCard(job) {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.innerHTML = `
            ${job.isUrgent ? '<div class="urgent-badge">Urgent</div>' : ''}
            <div class="job-header">
                <div class="job-info">
                    <h3 class="job-title">${job.title}</h3>
                    <p class="job-company">${job.company}</p>
                </div>
                <span class="job-type">${job.type}</span>
            </div>
            
            <div class="job-details">
                <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                <span><i class="fas fa-dollar-sign"></i> ${job.salary}</span>
                <span><i class="fas fa-briefcase"></i> ${job.experience}</span>
            </div>
            
            <p class="job-description">${job.description}</p>
            
            <div class="job-actions">
                <button class="btn btn-primary apply-btn" data-job-id="${job.id}">
                    <i class="fas fa-paper-plane"></i> Apply Now
                </button>
                <button class="btn btn-outline save-btn" data-job-id="${job.id}">
                    <i class="fas fa-bookmark"></i> Save
                </button>
            </div>
        `;

        const applyBtn = jobCard.querySelector('.apply-btn');
        const saveBtn = jobCard.querySelector('.save-btn');

        applyBtn.addEventListener('click', () => this.handleJobApplication(job.id));
        saveBtn.addEventListener('click', () => this.handleSaveJob(job.id));

        return jobCard;
    }

    handleSearch() {
        const searchTerm = document.getElementById('jobSearch').value.toLowerCase().trim();
        const locationTerm = document.getElementById('locationSearch').value.toLowerCase().trim();

        let filteredJobs = this.jobs;

        if (searchTerm) {
            filteredJobs = filteredJobs.filter(job =>
                job.title.toLowerCase().includes(searchTerm) ||
                job.company.toLowerCase().includes(searchTerm) ||
                job.description.toLowerCase().includes(searchTerm)
            );
        }

        if (locationTerm) {
            filteredJobs = filteredJobs.filter(job =>
                job.location.toLowerCase().includes(locationTerm)
            );
        }

        this.currentPage = 1;
        this.displayJobs(filteredJobs.slice(0, this.jobsPerPage));
    }

    filterJobs() {
        const category = document.getElementById('categoryFilter').value;
        const city = document.getElementById('cityFilter').value;
        const experience = document.getElementById('experienceFilter').value;
        const salary = document.getElementById('salaryFilter').value;

        let filteredJobs = this.jobs;

        if (category) {
            filteredJobs = filteredJobs.filter(job => job.category === category);
        }

        if (city) {
            filteredJobs = filteredJobs.filter(job => job.location === city);
        }

        if (experience) {
            filteredJobs = filteredJobs.filter(job => job.experience === experience);
        }

        if (salary) {
            // Simple salary filter implementation
            filteredJobs = filteredJobs.filter(job => {
                const jobSalary = parseInt(job.salary.replace(/[^0-9]/g, ''));
                switch (salary) {
                    case '0-30000': return jobSalary <= 30000;
                    case '30000-60000': return jobSalary > 30000 && jobSalary <= 60000;
                    case '60000-100000': return jobSalary > 60000 && jobSalary <= 100000;
                    case '100000+': return jobSalary > 100000;
                    default: return true;
                }
            });
        }

        this.currentPage = 1;
        this.displayJobs(filteredJobs.slice(0, this.jobsPerPage));
    }

    clearAllFilters() {
        document.getElementById('categoryFilter').value = '';
        document.getElementById('cityFilter').value = '';
        document.getElementById('experienceFilter').value = '';
        document.getElementById('salaryFilter').value = '';
        document.getElementById('jobSearch').value = '';
        document.getElementById('locationSearch').value = '';

        this.currentPage = 1;
        this.displayJobs(this.getPaginatedJobs());
    }

    loadMoreJobs() {
        this.currentPage++;
        this.displayJobs(this.getPaginatedJobs());
    }

    async handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = e.target.querySelector('.login-submit');

        if (!email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            this.setButtonLoading(submitBtn, true);

            // Simulate API call
            setTimeout(() => {
                const user = {
                    id: '1',
                    name: 'Test User',
                    email: email,
                    userType: 'candidate'
                };
                const token = 'mock_jwt_token';

                this.currentUser = user;
                this.authToken = token;

                localStorage.setItem('pakjobs_user', JSON.stringify(user));
                localStorage.setItem('pakjobs_token', token);

                this.updateUIForLoggedInUser();
                this.hideModal('loginModal');
                this.showNotification('Welcome to PakJobs! Login successful.', 'success');
                this.setButtonLoading(submitBtn, false);
            }, 1500);

        } catch (error) {
            this.showNotification('Login failed. Please try again.', 'error');
            this.setButtonLoading(submitBtn, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();

        const userType = document.querySelector('input[name="userType"]:checked').value;
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitBtn = e.target.querySelector('.register-submit');

        if (!name || !email || !password || !confirmPassword) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters long', 'error');
            return;
        }

        if (!document.getElementById('agreeTerms').checked) {
            this.showNotification('Please agree to the terms and conditions', 'error');
            return;
        }

        try {
            this.setButtonLoading(submitBtn, true);

            // Simulate API call
            setTimeout(() => {
                const user = {
                    id: '1',
                    name: name,
                    email: email,
                    userType: userType,
                    companyName: userType === 'employer' ? `${name}'s Company` : undefined
                };
                const token = 'mock_jwt_token';

                this.currentUser = user;
                this.authToken = token;

                localStorage.setItem('pakjobs_user', JSON.stringify(user));
                localStorage.setItem('pakjobs_token', token);

                this.updateUIForLoggedInUser();
                this.hideModal('registerModal');
                this.showNotification('Account created successfully! Welcome to PakJobs.', 'success');
                this.setButtonLoading(submitBtn, false);
            }, 1500);

        } catch (error) {
            this.showNotification('Registration failed. Please try again.', 'error');
            this.setButtonLoading(submitBtn, false);
        }
    }

    updateUIForLoggedInUser() {
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <span class="user-greeting">Welcome, ${this.currentUser.name}</span>
                <button class="btn btn-outline" id="dashboardBtn">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </button>
                <button class="btn btn-outline" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            `;

            document.getElementById('dashboardBtn').addEventListener('click', () => this.showDashboard());
            document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
        }
    }

    handleLogout() {
        this.currentUser = null;
        this.authToken = null;
        localStorage.removeItem('pakjobs_user');
        localStorage.removeItem('pakjobs_token');

        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <button class="btn btn-outline" id="loginBtn">Login</button>
                <button class="btn btn-primary" id="registerBtn">Register</button>
            `;

            document.getElementById('loginBtn').addEventListener('click', () => this.showModal('loginModal'));
            document.getElementById('registerBtn').addEventListener('click', () => this.showModal('registerModal'));
        }

        this.showNotification('You have been logged out successfully', 'success');
    }

    handleJobApplication(jobId) {
        if (!this.currentUser) {
            this.showNotification('Please login to apply for jobs', 'error');
            this.showModal('loginModal');
            return;
        }

        if (this.currentUser.userType === 'employer') {
            this.showNotification('Employers cannot apply for jobs', 'error');
            return;
        }

        this.showNotification('Application submitted successfully!', 'success');

        const applyBtn = document.querySelector(`[data-job-id="${jobId}"]`);
        if (applyBtn) {
            applyBtn.innerHTML = '<i class="fas fa-check"></i> Applied';
            applyBtn.disabled = true;
            applyBtn.classList.remove('btn-primary');
            applyBtn.classList.add('btn-success');
        }
    }

    handleSaveJob(jobId) {
        if (!this.currentUser) {
            this.showNotification('Please login to save jobs', 'error');
            this.showModal('loginModal');
            return;
        }

        const saveBtn = document.querySelector(`.save-btn[data-job-id="${jobId}"]`);
        if (saveBtn) {
            const isSaved = saveBtn.classList.contains('btn-primary');

            if (isSaved) {
                saveBtn.innerHTML = '<i class="fas fa-bookmark"></i> Save';
                saveBtn.classList.remove('btn-primary');
                saveBtn.classList.add('btn-outline');
                this.showNotification('Job removed from saved items', 'success');
            } else {
                saveBtn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
                saveBtn.classList.remove('btn-outline');
                saveBtn.classList.add('btn-primary');
                this.showNotification('Job saved successfully!', 'success');
            }
        }
    }

    showPostJobModal() {
        if (!this.currentUser) {
            this.showNotification('Please login to post jobs', 'error');
            this.showModal('loginModal');
            return;
        }

        if (this.currentUser.userType !== 'employer') {
            this.showNotification('Only employers can post jobs', 'error');
            return;
        }

        this.showNotification('Employer features coming soon!', 'info');
    }

    showDashboard() {
        this.showNotification('Dashboard features coming soon!', 'info');
    }

    animateStats() {
        const stats = {
            activeJobs: 200000,
            companies: 50000,
            candidates: 6000000,
            successStories: 2000000
        };

        Object.keys(stats).forEach(stat => {
            const element = document.getElementById(stat);
            if (element) {
                this.animateCounter(element, stats[stat]);
            }
        });
    }

    animateCounter(element, target) {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = this.formatNumber(target) + '+';
                clearInterval(timer);
            } else {
                element.textContent = this.formatNumber(Math.floor(current)) + '+';
            }
        }, 30);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';

            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
        }
    }

    setButtonLoading(button, loading) {
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');

        if (loading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'block';
            button.disabled = true;
        } else {
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            button.disabled = false;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.getElementById('notificationContainer');
        container.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    async apiCall(endpoint, options = {}) {
        const url = `${this.API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
                ...options.headers
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            this.showLoading();
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API call failed:', error);
            this.showNotification(error.message || 'Something went wrong. Please try again.', 'error');
            throw error;
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'flex';
        }
        this.isLoading = true;
    }

    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
        this.isLoading = false;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PakJobsPortal();
});