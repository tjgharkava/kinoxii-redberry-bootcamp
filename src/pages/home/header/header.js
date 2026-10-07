import './header.css'

export function renderHeader() {
    return `
        <header class="header">
        
            <div class="header-logo">
                <h2>KINO <span>XII</span></h2>
                <nav class="main-nav">
                    <a href="#sessions" class="active">SESSIONS</a>
                </nav>
            </div>

            <div class="header-right">
                
                <div class="search-box">

                    <button class="search-btn" id="search-open">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>

                    <input
                        id="search-input"
                        type="text"
                        placeholder="Search films and live events"
                    >

                    <div class="search-modal" id="search-modal">

                            <div class="search-prompt" id="search-prompt">
                                <div class="search-prompt-icon">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                </div>

                                <h3>What do you want to watch?</h3>
                                <p>Search by title, director or cast</p>
                                <button class="browse-btn">Browse all sessions</button>
                            </div>

                            <div class="search-prompt-results" id="search-prompt-results" style="display: none;"> 
                                <div class="results-header">
                                    <p>FILMS & EVENTS</p>
                                    <span id="results-count">0 results</span>
                                </div>

                                <div class="results-list" id="modal-search-results"></div>   
                            </div>

                            <div class="search-no-results" id="search-no-results" style="display: none;">
                                <div class="search-icon-box">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                </div>

                                <h3>No results for "<span id="no-results-query"></span>"</h3>
                                <p>Check the spelling or try another film or live event.</p>
                                <button class="browse-btn">Browse all sessions</button>
                            </div>

                        </div>
                    </div>

                <div class="auth-buttons">
                    <button class="signup-btn"><a href="#signup">Sign Up</a></button>
                    <button class="login-btn"><a href="#login">Log In</a></button>
                </div>
            </div>
        </header>

        
    `
}

export async function searchMovies(query) {
    const response = await fetch(
        `https://api.kinoxii.redberryinternship.ge/api/search?q=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    return data.data;
}

export function setupSearch() {

    const searchOpen = document.querySelector('#search-open');
    const searchInput = document.querySelector('#search-input');
    const searchModal = document.querySelector('#search-modal');
    const searchBox = document.querySelector('.search-box');

    const initialState = document.querySelector('#search-prompt');
    const resultsState = document.querySelector('#search-prompt-results');
    const noResultsState = document.querySelector('#search-no-results');
    const modalSearchResults = document.querySelector('#modal-search-results');

    const resultsCount = document.querySelector('#results-count');
    const noResultsQuery = document.querySelector('#no-results-query');

    const browseSessions = document.querySelectorAll('.browse-btn');


    let debounceTimer;

    function resetSearchStates() {
        initialState.style.display = 'flex';
        resultsState.style.display = 'none';
        noResultsState.style.display = 'none';
        modalSearchResults.innerHTML = '';
    }

    function openModal() {

    searchBox.classList.add('active');
    searchModal.classList.add('active');

    resetSearchStates();
}

    function closeModal() {
        searchBox.classList.remove('active');
        searchModal.classList.remove('active');

        resetSearchStates();
    }

    document.addEventListener('click', (event) => {
        if (
            event.target.closest('#search-open') ||
            event.target.closest('#search-input')
        ) {
            console.log('SEARCH CLICKED');
            openModal();
        }
    });

    browseSessions.forEach(button => {
        button.addEventListener('click', () => {
            window.location.hash = 'sessions';
        })
    })

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();

        clearTimeout(debounceTimer);

        if (!query) {
            resetSearchStates();
            searchInput.focus();
            return;
        }

        debounceTimer = setTimeout(async () => {
            const movies = await searchMovies(query);

            if (!movies || movies.length === 0) {
                initialState.style.display = 'none';
                resultsState.style.display = 'none';
                noResultsState.style.display = 'flex';

                noResultsQuery.textContent = query;

                return;
            }

            initialState.style.display = 'none';
            noResultsState.style.display = 'none';
            resultsState.style.display = 'block';

            resultsCount.textContent = `${movies.length} results`;

            modalSearchResults.innerHTML = movies.map(movie => `
                <div class="search-result-item">

                    <img 
                        src="${movie.posterUrl}" 
                        alt="${movie.title}"
                    >

                    <div class="search-result-info">
                        <h3>${movie.title}</h3>
                        <p>
                            Film · ${movie.ageRating?.code} · ${movie.runtimeMinutes} min
                        </p>
                    </div>

                    <div class="search-result-action">
                        <span class="price">From ₾${movie.fromPrice}</span>
                    </div>

                </div>
            `).join('');
        }, 300);
    });

    document.addEventListener('click', (event) => {
        if (!searchBox.contains(event.target)) {
            closeModal();
        }
    });
}