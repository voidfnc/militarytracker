let allFetchedArticles = []; // Store all articles globally
    const articlesPerPage = 10; // Number of articles to display per load
    let currentArticles = []; // Articles for the current view (all articles, no categories)
    let currentPage = 1; // Track the current page for loading more

    // Function to format date
    function formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Function to display news
    function displayNews(page = 1) {
      const newsCarousel = document.getElementById('news-carousel');
      const loadMoreBtn = document.getElementById('load-more-news');
      const loadingIndicator = document.getElementById('news-loading');

      if (page === 1) {
        newsCarousel.innerHTML = ''; // Clear existing news only for first page
        loadingIndicator.style.display = 'block'; // Show loading indicator
        currentArticles = allFetchedArticles; // All articles are the current articles
      }

      const startIndex = (page - 1) * articlesPerPage;
      const endIndex = startIndex + articlesPerPage;
      const articlesToRender = currentArticles.slice(startIndex, endIndex);

      if (articlesToRender.length === 0 && page === 1) {
        newsCarousel.innerHTML = '<p class="text-center my-4">No news articles found.</p>';
      } else {
        articlesToRender.forEach(article => {
          const newsCard = document.createElement('div');
          newsCard.classList.add('news-card', 'animate__animated', 'animate__fadeIn');

          // Remove image, add category label instead
          const category = article.category || 'General';
          newsCard.innerHTML = `
            <div class="news-content">
              <div class="news-date">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9H21M7 3V5M17 3V5M6 13H8M6 17H8M11 13H13M11 17H13M16 13H18M16 17H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.0799 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </div>
              <h4 class="news-title">${article.title}</h4>
              <p class="news-excerpt">${article.description ? article.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' : 'No description available.'}</p>
              <a href="${article.link}" class="news-link" target="_blank" rel="noopener noreferrer">
                Read more
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
          `;
          newsCarousel.appendChild(newsCard);
        });
      }
      loadingIndicator.style.display = 'none'; // Hide loading indicator

      // Show/hide load more button
      if (endIndex < currentArticles.length) {
        loadMoreBtn.style.display = 'block';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }

    // Fetch all news initially
    async function fetchAllNewsAndDisplay() {
      const rssFeeds = [
        'https://www.military.com/rss/news',
        'https://apnews.com/apf-topnews.rss', // AP News for global conflicts
        'https://www.aljazeera.com/xml/rss/all.xml', // Al Jazeera for global conflicts
        'https://www.bleepingcomputer.com/feed/',
        'https://thehackernews.com/feeds/posts/default',
        'https://cybersecuritynews.com/feed/',
        'https://www.securityweek.com/feed/',
        'https://www.darkreading.com/rss_simple.xml', // Dark Reading for cybersecurity
        'https://www.defensenews.com/arc/outboundfeeds/rss/category/defense/feed/'
      ];
      
      for (const feedUrl of rssFeeds) {
        try {
          const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
          const data = await response.json();

          if (data.status === 'ok' && data.items) {
            allFetchedArticles = allFetchedArticles.concat(data.items);
          } else {
            console.error('Error fetching RSS feed:', data.message || 'Unknown error', feedUrl);
          }
        } catch (error) {
          console.error('Failed to fetch RSS feed:', feedUrl, error);
        }
      }

      // Sort all articles by publication date (newest first)
      allFetchedArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      
      // Store in localStorage for radar.html access
      try {
        localStorage.setItem('allFetchedArticles', JSON.stringify(allFetchedArticles.map(a => ({
          title: a.title,
          link: a.link
        }))));
      } catch (e) {
        // Ignore storage errors
      }

      displayNews(1); // Display first page of all news by default
    }

    // Event listeners for category buttons (removed as per new instructions)
    document.addEventListener('DOMContentLoaded', () => {
      // Mobile device detection
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        document.documentElement.classList.add('mobile-device');
      }

      // Load More button event listener
      const loadMoreBtn = document.createElement('button');
      loadMoreBtn.id = 'load-more-news';
      loadMoreBtn.classList.add('btn', 'btn-secondary', 'mt-3', 'w-100');
      loadMoreBtn.textContent = 'Load More News';
      loadMoreBtn.style.display = 'none'; // Hidden by default
      document.querySelector('.widget.animate__animated.animate__fadeIn.animate-delay-3').appendChild(loadMoreBtn); // Append to the news widget

      loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        displayNews(currentPage);
      });

      fetchAllNewsAndDisplay(); // Initial fetch and display
    });

    // Preloader
    window.addEventListener('load', function() {
      setTimeout(function() {
        document.getElementById('preloader').classList.add('hidden');
      }, 1000);
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
      const navbar = document.querySelector('.navbar');
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Theme switcher
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    const htmlEl = document.documentElement;
    let darkMode = true;

    function setTheme(isDark) {
      darkMode = isDark;
      if (!darkMode) {
        htmlEl.classList.add('theme-light');
        themeToggleIcon.innerHTML = `
          <path d="M12 3C12.5523 3 13 3.44772 13 4V5C13 5.55228 12.5523 6 12 6C11.4477 6 11 5.55228 11 5V4C11 3.44772 11.4477 3 12 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 18C12.5523 18 13 18.4477 13 19V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V19C11 18.4477 11.4477 18 12 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5.63604 5.63604C6.02656 5.24552 6.02656 4.61235 5.63604 4.22183C5.24552 3.83131 4.61235 3.83131 4.22183 4.22183L3.51472 4.92893C3.1242 5.31946 3.1242 5.95262 3.51472 6.34315C3.90525 6.73367 4.53841 6.73367 4.92893 6.34315L5.63604 5.63604Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M18.364 18.364C18.7545 18.7545 18.7545 19.3877 18.364 19.7782C17.9734 20.1687 17.3403 20.1687 16.9497 19.7782L16.2426 19.0711C15.8521 18.6805 15.8521 18.0474 16.2426 17.6569C16.6332 17.2663 17.2663 17.2663 17.6569 17.6569L18.364 18.364Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 12C3 11.4477 3.44772 11 4 12L5 12C5.55228 12 6 12.4477 6 13C6 13.5523 5.55228 14 5 14H4C3.44772 14 3 13.5523 3 13V12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M18 12C18.5523 12 19 12.4477 19 13V14C19 14.5523 18.5523 15 18 15H17C16.4477 15 16 14.5523 16 14C16 13.4477 16.4477 13 17 13L18 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5.63604 18.364C5.24552 17.9734 5.24552 17.3403 5.63604 16.9497L6.34315 16.2426C6.73367 15.8521 7.36684 15.8521 7.75736 16.2426C8.14789 16.6332 8.14789 17.2663 7.75736 17.6569L7.05025 18.364C6.65973 18.7545 6.02656 18.7545 5.63604 18.364Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M18.364 5.63604C18.7545 6.02656 18.7545 6.65973 18.364 7.05025L17.6569 7.75736C17.2663 8.14789 16.6332 8.14789 16.2426 7.75736C15.8521 7.36684 15.8521 6.73367 16.2426 6.34315L16.9497 5.63604C17.3403 5.24552 17.9734 5.24552 18.364 5.63604Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        `;
      } else {
        htmlEl.classList.remove('theme-light');
        themeToggleIcon.innerHTML = `
          <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
          <path d="M12 2V4M12 20V2M4 12H2m20 0h-2M6.343 6.343L5.05 5.05M18.95 18.95l-1.293-1.293M6.343 17.657l-1.293 1.293M18.95 5.05l-1.293 1.293" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        `;
      }
      localStorage.setItem('darkMode', darkMode);
    }

    function toggleTheme() {
      setTheme(!darkMode);
    }

    themeToggleBtn.addEventListener('click', toggleTheme);

    // Check for saved theme preference
    if (localStorage.getItem('darkMode') === 'false') {
      setTheme(false);
    } else {
      setTheme(true);
    }

    // Animate elements when they come into view
    const animateOnScroll = function() {
      const elements = document.querySelectorAll('.widget, .stat-card, .feature-card, .news-card');
      
      elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (elementPosition < screenPosition) {
          element.classList.add('animate__animated', 'animate__fadeInUp');
        }
      });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on page load

    // Fallback for iframe block (in case onerror isn't triggered)
    window.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        var iframe = document.getElementById('adsbexchange-embed');
        if (iframe && (!iframe.contentWindow || (iframe.contentDocument && iframe.contentDocument.body.innerHTML.includes("refused")))) {
          iframe.style.display = "none";
          document.getElementById('radar-fallback').style.display = 'flex';
        }
      }, 3000);
    });

    // --- News Carousel Auto-Scrolling ---
    // Fetch news from index.html (assumes CORS/local, or fallback to static demo)
    async function fetchNewsForCarousel() {
      try {
        let articles = [];
        if (window.localStorage && localStorage.getItem('allFetchedArticles')) {
          articles = JSON.parse(localStorage.getItem('allFetchedArticles'));
        } else {
          // Fallback: fetch index.html and extract news titles and links
          const res = await fetch('index.html');
          const text = await res.text();
          // Extract both title and link if possible
          const matches = [...text.matchAll(/<h4 class="news-title">(.*?)<\/h4>[\s\S]*?<a href="([^"]+)" class="news-link"/g)];
          if (matches.length) {
            articles = matches.map(m => ({ title: m[1], link: m[2] }));
          } else {
            // fallback: just titles
            const titleMatches = [...text.matchAll(/<h4 class="news-title">(.*?)<\/h4>/g)];
            articles = titleMatches.map(m => ({ title: m[1], link: '#' }));
          }
        }
        return articles.slice(0, 10);
      } catch (e) {
        return [{ title: 'Unable to load news.', link: '#' }];
      }
    }

    function renderNewsCarousel(articles) {
      const carousel = document.getElementById('news-carousel');
      if (!carousel) return;
      // Show each news as a card-like block with spacing and truncation
      carousel.innerHTML = articles.map(function(a) {
        var title = a.title || a.headline || '';
        var link = a.link && a.link !== '#' ? a.link : null;
        if (title) {
          var displayTitle = title.length > 110 ? title.substring(0, 110) + '…' : title;
          return '<span class="carousel-item">' +
            (link ? '<a href="' + link + '" target="_blank" class="carousel-link">' + displayTitle + '</a>' : displayTitle) +
          '</span>';
        }
        return '';
      }).join('');
    }

    function startCarouselScroll() {
      const carousel = document.getElementById('news-carousel');
      if (!carousel) return;
      let scrollAmount = 0;
      setInterval(() => {
        scrollAmount += 1;
        if (scrollAmount >= carousel.scrollWidth - carousel.clientWidth) {
          scrollAmount = 0;
        }
        carousel.scrollTo({ left: scrollAmount, behavior: 'smooth' });
      }, 40);
    }

    // Initialize carousel on DOMContentLoaded
    window.addEventListener('DOMContentLoaded', async function() {
      const articles = await fetchNewsForCarousel();
      renderNewsCarousel(articles);
      if (window.location.pathname.includes('radar.html')) {
        startCarouselScroll();
      }
    });
    // --- End News Carousel ---
