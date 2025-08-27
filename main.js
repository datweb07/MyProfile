// Search functionality
let searchData = [];

// Initialize search data
function initializeSearchData() {
    searchData = [
        // Home page content
        {
            type: 'profile',
            title: 'Dat Truong',
            content: 'Information Technology IT University Economics Ho Chi Minh City UEH Fullstack NET Developer C# ASP.NET Core SQL Server HTML CSS JavaScript React problem-solving teamwork',
            page: 'home',
        },
        {
            type: 'education',
            title: 'THPT Dong Phu',
            content: 'Aug 2021 Jun 2024 THPT Dong Phu Mathematics',
            page: 'home',
        },
        {
            type: 'education', 
            title: 'UEH University',
            content: 'Aug 2024 Present Bachelor Information Technology UEH University',
            page: 'home',
        },
        // Projects
        {
            type: 'project',
            title: 'Smart File System Simulator',
            content: 'Windows Forms application simulating FAT Inode file systems creation deletion read write operations memory visualization C# WinForms',
            page: 'projects',
        },
        {
            type: 'project',
            title: 'Accessible Chat Application', 
            content: 'cross-platform Flutter app visually impaired students screen reader support voice commands real-time messaging Flutter Firebase',
            page: 'projects',
        },
        {
            type: 'project',
            title: 'Calculator Simulator',
            content: 'WinForms project computer program infix expression postfix Data Structure Algorithm DSA C# WinForms',
            page: 'projects',
        },
        {
            type: 'project',
            title: 'Supermarket Sales Management',
            content: 'WinForms project supermarket sales management Object-Oriented Programming OOP C# WinForms',
            page: 'projects',
        }
    ];
}

function toggleSearch() {
    const searchBox = document.getElementById('searchBox');
    const searchInput = searchBox.querySelector('.search-input');
    
    if (searchBox.classList.contains('active')) {
        searchBox.classList.remove('active');
        searchInput.value = '';
        document.getElementById('searchResults').innerHTML = '';
    } else {
        searchBox.classList.add('active');
        searchInput.focus();
    }
}

function performSearch(query) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }

    const results = searchData.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.content.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">Không tìm thấy kết quả</div>';
        return;
    }

    resultsContainer.innerHTML = results.map(result => {
        const highlightedTitle = highlightText(result.title, query);
        const excerpt = getExcerpt(result.content, query);
        
        return `
            <div class="search-result" onclick="selectSearchResult('${result.page}')">
                <div class="search-result-type">${getTypeLabel(result.type)}</div>
                <div class="search-result-title">${highlightedTitle}</div>
                <div class="search-result-excerpt">${excerpt}</div>
            </div>
        `;
    }).join('');
}

function highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function getExcerpt(content, query) {
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return content.substring(0, 100) + '...';
    
    const start = Math.max(0, index - 30);
    const end = Math.min(content.length, index + query.length + 70);
    let excerpt = content.substring(start, end);
    
    if (start > 0) excerpt = '...' + excerpt;
    if (end < content.length) excerpt = excerpt + '...';
    
    return highlightText(excerpt, query);
}

function getTypeLabel(type) {
    switch(type) {
        case 'profile': return 'Profile';
        case 'education': return 'Education';
        case 'project': return 'Project';
        default: return '';
    }
}

function selectSearchResult(page) {
    showPage(page);
    toggleSearch();
}

function handleSearchKeydown(event) {
    if (event.key === 'Escape') {
        toggleSearch();
    }
}

// Close search when clicking outside
document.addEventListener('click', function(event) {
    const searchContainer = document.querySelector('.search-container');
    const searchBox = document.getElementById('searchBox');
    
    if (!searchContainer.contains(event.target)) {
        searchBox.classList.remove('active');
    }
});

// Page navigation functions
function showPage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show selected page
    if (page === 'home') {
        document.getElementById('home-page').classList.add('active');
    } else if (page === 'projects') {
        document.getElementById('projects-page').classList.add('active');
    }

    // Scroll to top
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// Initialize search data when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeSearchData();
});

// Scroll progress bar
window.addEventListener('scroll', function() {
    const scrollProgress = document.querySelector('.scroll-progress');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    
    scrollProgress.style.width = scrollPercentage + '%';
});