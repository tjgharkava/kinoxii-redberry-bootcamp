import './header.css'
import { renderRegisterModal, setupRegisterModal } from '../../register/register.js';
import { isLoggedIn, getUser, logout } from '../../auth/auth.js';
import { renderLoginModal, setupLoginModal } from '../../register/login.js'

function getInitials(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function renderAuthArea() {
    if (!isLoggedIn()) {
        return `
            <div class="auth-buttons">
                <button class="signup-btn" id="signup-open">Sign Up</button>
                <button class="login-btn" id="login-open">Log In</button>
            </div>
        `;
    }

    const user = getUser();
    const displayName = user.fullName || user.username;
    const firstName = displayName.split(' ')[0];
    const status = user.profileComplete ? 'complete' : 'incomplete';

    const avatarMarkup = user.avatar
        ? `<img src="${user.avatar}" alt="${displayName}">`
        : getInitials(displayName);

    return `
        <div class="user-menu" id="user-menu">
            <button class="user-menu-btn" id="user-menu-btn">
                <span class="user-avatar">
                    ${avatarMarkup}
                    <i class="status-dot ${status}"></i>
                </span>
                <span class="user-name">${firstName}</span>
                <i class="fa-solid fa-chevron-down user-chevron"></i>
            </button>

            <div class="user-dropdown" id="user-dropdown">
                <div class="user-dropdown-head">
                    <span class="user-avatar">
                        ${avatarMarkup}
                        <i class="status-dot ${status}"></i>
                    </span>
                    <div class="user-dropdown-info">
                        <h4>${displayName}</h4>
                        <p>${user.email}</p>
                    </div>
                </div>

                ${user.profileComplete
                    ? `
                        <div class="profile-status complete">
                            Profile Complete <i class="fa-solid fa-check"></i>
                        </div>
                    `
                    : `
                        <div class="profile-status incomplete">
                            <strong>Profile incomplete</strong>
                            <p>Please complete your profile to enable booking</p>
                        </div>
                    `}

                <a href="#profile" class="user-dropdown-link">
                    <i class="fa-regular fa-user"></i> My Profile
                </a>
                <a href="#tickets" class="user-dropdown-link">
                    <i class="fa-solid fa-ticket"></i> My Tickets
                </a>

                <div class="user-dropdown-divider"></div>

                <button type="button" id="logout-btn" class="user-dropdown-logout">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i> Log out
                </button>
            </div>
        </div>
    `;
}

export function renderHeader() {
    return `
        <header class="header">
        
            <div class="header-logo">
                <h2><a href="#" class="home-logo">KINO <span>XII</span></a></h2>
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

                ${renderAuthArea()}
            </div>
        </header>
        ${isLoggedIn() ? '' : renderRegisterModal() + renderLoginModal()}
        
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
                            Film · ${movie.ageRating?.code ?? ''} · ${movie.runtimeMinutes} min
                        </p>
                    </div>

                    <div class="search-result-action">
                        <span class="price">From ₾${movie.fromPrice}</span>
                    </div>
                </div>
            `).join('');

            const resultItems = modalSearchResults.querySelectorAll('.search-result-item');

            resultItems.forEach((item, index) => {
                item.addEventListener('click', () => {
                    const slug = movies[index]?.slug;

                    if (typeof slug !== 'string' || !slug.trim()) {
                        console.error('Movie slug is missing:', movies[index]);
                        return;
                    }

                    window.location.hash = `#movie/${slug.trim()}`;
                });
            });

        }, 300);
    });

    document.addEventListener('click', (event) => {
        if (!searchBox.contains(event.target)) {
            closeModal();
        }
    });

    const userMenuBtn = document.querySelector('#user-menu-btn');
    const userDropdown = document.querySelector('#user-dropdown');

    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            userDropdown.classList.toggle('open');
        });

        document.addEventListener('click', () => userDropdown.classList.remove('open'));

        document.querySelector('#logout-btn').addEventListener('click', logout);
    }

    setupRegisterModal();
    setupLoginModal();
}