// DOM Elements
var authSection = document.getElementById('auth-section');
var mainSection = document.getElementById('main-section');
var loginForm = document.getElementById('login-form');
var signupForm = document.getElementById('signup-form');
var loginTab = document.getElementById('login-tab');
var signupTab = document.getElementById('signup-tab');
var welcomeUser = document.getElementById('welcome-user');
var userAvatar = document.getElementById('user-avatar');
var themeToggle = document.getElementById('theme-toggle');
var logoutBtn = document.getElementById('logout-btn');
var dashboard = document.getElementById('dashboard');
var searchInput = document.getElementById('search-input');
var sortSelect = document.getElementById('sort-select');
var postTitle = document.getElementById('post-title');
var postText = document.getElementById('post-text');
var imageUrl = document.getElementById('image-url');
var createPostBtn = document.getElementById('create-post-btn');
var postsFeed = document.getElementById('posts-feed');
var deleteModal = document.getElementById('delete-modal');
var cancelDelete = document.getElementById('cancel-delete');
var confirmDelete = document.getElementById('confirm-delete');
var editModal = document.getElementById('edit-modal');
var editPostTitle = document.getElementById('edit-post-title');
var editPostText = document.getElementById('edit-post-text');
var cancelEdit = document.getElementById('cancel-edit');
var saveEdit = document.getElementById('save-edit');
var closeModals = document.querySelectorAll('.close-modal');
var emojiBtns = document.querySelectorAll('.emoji-btn');

// Dashboard elements
var totalPostsEl = document.getElementById('total-posts');
var totalLikesEl = document.getElementById('total-likes');
var userPostsEl = document.getElementById('user-posts');

// App State
let currentUser = null;
let posts = JSON.parse(localStorage.getItem('posts')) || [];
let postToDelete = null;
let postToEdit = null;

// Initialize the app
function init() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainSection();
    }

    // Set up event listeners
    setupEventListeners();
    
    // Render posts
    renderPosts();
}

// Set up event listeners
function setupEventListeners() {
    // Auth tabs
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    signupTab.addEventListener('click', () => switchAuthTab('signup'));
    
    // Auth forms
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Post creation
    createPostBtn.addEventListener('click', createPost);
    
    // Search and sort
    searchInput.addEventListener('input', renderPosts);
    sortSelect.addEventListener('change', renderPosts);
    
    // Modals
    cancelDelete.addEventListener('click', () => deleteModal.classList.remove('active'));
    confirmDelete.addEventListener('click', deletePost);
    cancelEdit.addEventListener('click', () => editModal.classList.remove('active'));
    saveEdit.addEventListener('click', saveEditedPost);
    
    // Close modals
    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            deleteModal.classList.remove('active');
            editModal.classList.remove('active');
        });
    });
    
    // Emoji buttons
    emojiBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.getAttribute('data-emoji');
            postText.value += emoji;
        });
    });
}

// Switch between login and signup tabs
function switchAuthTab(tab) {
    if (tab === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simple validation (in a real app, this would be done on the server)
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainSection();
    } else {
        alert('Invalid email or password. Please try again.');
    }
}

// Handle signup
function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
        alert('An account with this email already exists. Please log in.');
        switchAuthTab('login');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        avatar: name.charAt(0).toUpperCase()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showMainSection();
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuthSection();
}

// Show auth section
function showAuthSection() {
    authSection.classList.remove('hidden');
    mainSection.classList.add('hidden');
    logoutBtn.style.display = 'none';
    
    // Reset forms
    loginForm.reset();
    signupForm.reset();
}

// Show main section after login
function showMainSection() {
    authSection.classList.add('hidden');
    mainSection.classList.remove('hidden');
    welcomeUser.textContent = `Welcome, ${currentUser.name}`;
    userAvatar.textContent = currentUser.avatar;
    logoutBtn.style.display = 'flex';
    
    // Update dashboard
    updateDashboard();
}

// Update dashboard statistics
function updateDashboard() {
    const userPosts = posts.filter(post => post.userId === currentUser.id);
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    const userLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
    
    totalPostsEl.textContent = posts.length;
    totalLikesEl.textContent = totalLikes;
    userPostsEl.textContent = userPosts.length;
}

// Toggle dark/light mode
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Create a new post
function createPost() {
    const title = postTitle.value.trim();
    const content = postText.value.trim();
    const image = imageUrl.value.trim();
    
    if (!content) {
        alert('Please write something in your post.');
        return;
    }
    
    const newPost = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        title,
        content,
        image,
        timestamp: new Date().toISOString(),
        likes: 0,
        liked: false,
        reactions: {
            '❤️': 0,
            '😂': 0,
            '😊': 0,
            '👍': 0,
            '🔥': 0
        },
        userReaction: null
    };
    
    posts.unshift(newPost);
    savePosts();
    renderPosts();
    updateDashboard();
    
    // Reset form
    postTitle.value = '';
    postText.value = '';
    imageUrl.value = '';
}

// Render posts based on search and sort
function renderPosts() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;
    
    // Filter posts
    let filteredPosts = posts.filter(post => 
        post.content.toLowerCase().includes(searchTerm) || 
        post.title?.toLowerCase().includes(searchTerm) ||
        post.userName.toLowerCase().includes(searchTerm)
    );
    
    // Sort posts
    if (sortBy === 'latest') {
        filteredPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortBy === 'oldest') {
        filteredPosts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else if (sortBy === 'most-liked') {
        filteredPosts.sort((a, b) => b.likes - a.likes);
    }
    
    // Render posts
    if (filteredPosts.length === 0) {
        postsFeed.innerHTML = `
            <div class="no-posts">
                <i class="far fa-comment-dots"></i>
                <h3>No posts found</h3>
                <p>Try adjusting your search or create a new post!</p>
            </div>
        `;
        return;
    }
    
    postsFeed.innerHTML = filteredPosts.map(post => `
        <div class="post" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-user">
                    <div class="post-avatar">${post.userAvatar}</div>
                    <div class="post-user-info">
                        <h3>${post.userName}</h3>
                        <div class="post-time">${formatTime(post.timestamp)}</div>
                    </div>
                </div>
                <div class="post-actions">
                    ${post.userId === currentUser.id ? `
                        <button class="btn btn-outline btn-small edit-post-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-small delete-post-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="post-content">
                ${post.title ? `<h3 class="post-title">${post.title}</h3>` : ''}
                <p class="post-text">${post.content}</p>
                ${post.image ? `<img src="${post.image}" class="post-image" alt="Post image">` : ''}
            </div>
            <div class="post-footer">
                <div class="like-section">
                    <button class="like-btn ${post.liked ? 'liked' : ''}">
                        <i class="fas fa-heart"></i>
                    </button>
                    <span class="like-count">${post.likes}</span>
                </div>
                <div class="reactions">
                    ${Object.entries(post.reactions).map(([emoji, count]) => `
                        <button class="reaction-btn ${post.userReaction === emoji ? 'active' : ''}" data-emoji="${emoji}">
                            ${emoji} <span>${count}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to post buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', handleLike);
    });
    
    document.querySelectorAll('.reaction-btn').forEach(btn => {
        btn.addEventListener('click', handleReaction);
    });
    
    document.querySelectorAll('.delete-post-btn').forEach(btn => {
        btn.addEventListener('click', confirmDeletePost);
    });
    
    document.querySelectorAll('.edit-post-btn').forEach(btn => {
        btn.addEventListener('click', openEditModal);
    });
}

// Handle like button click
function handleLike(e) {
    const postElement = e.target.closest('.post');
    const postId = postElement.getAttribute('data-post-id');
    const post = posts.find(p => p.id === postId);
    
    if (post.liked) {
        post.likes--;
        post.liked = false;
    } else {
        post.likes++;
        post.liked = true;
    }
    
    savePosts();
    renderPosts();
    updateDashboard();
}

// Handle reaction button click
function handleReaction(e) {
    const postElement = e.target.closest('.post');
    const postId = postElement.getAttribute('data-post-id');
    const post = posts.find(p => p.id === postId);
    const emoji = e.currentTarget.getAttribute('data-emoji');
    
    // If user already reacted with this emoji, remove the reaction
    if (post.userReaction === emoji) {
        post.reactions[emoji]--;
        post.userReaction = null;
    } else {
        // If user had a different reaction, remove that one first
        if (post.userReaction) {
            post.reactions[post.userReaction]--;
        }
        
        // Add the new reaction
        post.reactions[emoji]++;
        post.userReaction = emoji;
    }
    
    savePosts();
    renderPosts();
}

// Confirm post deletion
function confirmDeletePost(e) {
    const postElement = e.target.closest('.post');
    const postId = postElement.getAttribute('data-post-id');
    postToDelete = postId;
    deleteModal.classList.add('active');
}

// Delete post
function deletePost() {
    posts = posts.filter(post => post.id !== postToDelete);
    savePosts();
    renderPosts();
    updateDashboard();
    deleteModal.classList.remove('active');
    postToDelete = null;
}

// Open edit modal
function openEditModal(e) {
    const postElement = e.target.closest('.post');
    const postId = postElement.getAttribute('data-post-id');
    postToEdit = posts.find(post => post.id === postId);
    
    editPostTitle.value = postToEdit.title || '';
    editPostText.value = postToEdit.content;
    editModal.classList.add('active');
}

// Save edited post
function saveEditedPost() {
    if (!postToEdit) return;
    
    postToEdit.title = editPostTitle.value.trim();
    postToEdit.content = editPostText.value.trim();
    savePosts();
    renderPosts();
    editModal.classList.remove('active');
    postToEdit = null;
}

// Format timestamp
function formatTime(timestamp) {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return postTime.toLocaleDateString();
}

// Save posts to localStorage
function savePosts() {
    localStorage.setItem('posts', JSON.stringify(posts));
}

// Initialize the app
init();