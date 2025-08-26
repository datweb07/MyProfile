// Search functionality
        let searchData = [];
        
        // Initialize search data
        function initializeSearchData() {
            searchData = [
                // Home page content
                {
                    type: 'profile',
                    title: 'Về tôi',
                    content: 'Tôi tốt nghiệp từ Trường Đại học Kinh tế TP.HCM UEH với bằng Cử nhân Khoa học Dữ liệu giám sát bởi TS Đặng Thanh Phòng thí nghiệm Phân tích Dữ liệu Thông minh AI Engineer TMA Solutions thị giác ngôn ngữ VLMs mô hình sinh tổng quát sâu học máy',
                    page: 'home',
                    action: () => showPage('home')
                },
                // News items
                {
                    type: 'news',
                    title: 'Gia nhập TMA Solutions',
                    content: 'Oct 18 2024 TMA Solutions Kỹ sư AI Thực tập sinh Mô hình Thị giác Ngôn ngữ',
                    page: 'home',
                    action: () => showPage('home')
                },
                {
                    type: 'news',
                    title: 'Học bổng Odon Vallet',
                    content: 'Aug 14 2024 Odon Vallet scholarship',
                    page: 'home',
                    action: () => showPage('home')
                },
                // Publications
                {
                    type: 'publication',
                    title: 'Performance Insights of Attention-Free Language Models',
                    content: 'Nguyen Q Viet Attention-Free Language Models Sentiment Analysis E-Commerce Vietnam Inventive Communication Computational Technologies 2024',
                    page: 'publications',
                    action: () => showPage('publications')
                },
                {
                    type: 'publication', 
                    title: 'Customer Intent Mining from Service Inquiries',
                    content: 'Customer Intent Mining Service Inquiries Deep Embedded Clustering Journal Uncertain Systems 2024',
                    page: 'publications',
                    action: () => showPage('publications')
                },
                {
                    type: 'publication',
                    title: 'LSTM and BiLSTM in Stock Price Prediction',
                    content: 'LSTM BiLSTM Stock Price Prediction Inventive Communication Computational Technologies 2023',
                    page: 'publications', 
                    action: () => showPage('publications')
                },
                // Blog posts
                {
                    type: 'blog',
                    title: 'A Data-Centric Analysis on Advancing Vision-Language Models',
                    content: 'Data-Centric Analysis Vision-Language Models VLMs Awesome-VLM-Data GitHub repo Feb 2025',
                    page: 'blog',
                    action: () => showPage('blog')
                },
                {
                    type: 'blog',
                    title: 'The VILA Model Family',
                    content: 'VILA Model Family Vision-Language models efficiency Oct 2024',
                    page: 'blog',
                    action: () => showPage('blog')
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
                    <div class="search-result" onclick="selectSearchResult('${result.page}', this)">
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
                case 'profile': return 'Hồ sơ';
                case 'news': return 'Tin tức';
                case 'publication': return 'Bài báo';
                case 'blog': return 'Blog';
                default: return '';
            }
        }

        function selectSearchResult(page, element) {
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
            
            // Remove active class from all nav links
            document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
            
            // Show selected page
            if (page === 'home') {
                document.getElementById('home-page').classList.add('active');
            } else if (page === 'publications') {
                document.getElementById('publications-page').classList.add('active');
                document.getElementById('nav-publications').classList.add('active');
            } else if (page === 'blog') {
                document.getElementById('blog-page').classList.add('active');
                document.getElementById('nav-blog').classList.add('active');
            } else if (page === 'projects') {  // Thêm phần này
                document.getElementById('projects-page').classList.add('active');
                document.getElementById('nav-projects').classList.add('active'); // Vì bạn đang dùng nav-projects cho Projects
            }

            // Scroll to top
            window.scrollTo({top: 0, behavior: 'smooth'});
        }

        // Initialize search data when page loads
        document.addEventListener('DOMContentLoaded', function() {
            initializeSearchData();
        });