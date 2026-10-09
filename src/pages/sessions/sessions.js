import './sessions.css'
import { renderHeader, setupSearch } from '../../pages/home/header/header.js';
import { renderFooter } from '../../pages/home/footer/footer.js';

export function renderSessionsPage() {
    
    return `
        ${renderHeader()}

        <main class="sessions-page-main">
            <div class="sessions-page">
                <section class="page-header">
                    <h1>Sessions</h1>
                    <p>Browse showtimes across all venues</p>
                </section>

                <section class="sessions-content">
                    <aside class="sessions-filters">
                        <h3>Filter</h3>
                        
                        <div class="filter-group">
                            <p>VENUE</p>
                            <div id="venue-options"></div>
                        </div>

                        <div class="filter-group">
                            <p>DATE</p>
                            <div id="date-options"></div>
                        </div>

                        <div class="filter-group">
                            <p>FORMAT</p>
                            <div id="format-options"></div>
                        </div>

                        <div class="filter-group">
                            <p>LANGUAGE</p>
                            <div id="language-options"></div>
                        </div>

                        <div class="filter-group">
                            <p>TIME OF A DAY</p>
                            <div id="time-options"></div>
                        </div>

                        
                    </aside>

                    <div class="active-filters">
                        <span id="active-filters-count">0</span> FILTERS ACTIVE
                    </div>

                </section>
            </div>

            <div class="sessions-results">
                <div class="sessions-result-header">
                    <span id="sessions-count">Showing 0 sessions</span>
                    <div class="sort-container">
                        <label for="sessions-sort">Sort:</label>
                        <select id="sessions-sort">
                            <option value=""></option>
                        </select>
                    </div>
                </div>

                <div id="sessions-list"></div>

                <div id="sessions-pagination" class="sessions-pagination"></div>
            </div>
            
        </main>
        ${renderFooter()}
    `
}


export async function fetchFilterOptions() {
    const response = await fetch(
        'https://api.kinoxii.redberryinternship.ge/api/filter-options'
    );

    const data = await response.json();

    return data.data;
}

function renderVenues(filterOptions) {
    const venueOptions = document.querySelector('#venue-options');

    venueOptions.innerHTML = filterOptions.venues.map(venue => `
            <label>
                <input type="checkbox" value="${venue.slug}">
                <span class="venue-name">${venue.name}</span>
                <span class="venue-city">· ${venue.city}</span>
            </label>
        `).join('');
}

function renderFormats(filterOptions) {
    const formatOptions = document.querySelector('#format-options');

    formatOptions.innerHTML = filterOptions.formats.map(format => `
        <label>
            <input type="checkbox" value="${format.slug}">
            <span class="format-name">${format.name}</span>
        </label>
    `).join('');
}

function renderLanguages(filterOptions) {
    const languageOptions = document.querySelector('#language-options');

    languageOptions.innerHTML = filterOptions.languages.map(language => `
        <label>
            <input type="checkbox" value="${language.slug}">
            <span class="language-name">${language.name}</span>
        </label>
    `).join('');
}

function renderTimeBands(filterOptions) {
    const timeOptions = document.querySelector('#time-options');

    timeOptions.innerHTML = filterOptions.timeBands.map(timeBand => `
        <label>
            <input type="checkbox" value="${timeBand.id}">
            <span class="time-band-name">${timeBand.label}</span>
        </label>
    `).join('');
}

function setupCheckboxFilters() {

    const filterGroups = [
        { selector: '#venue-options', key: 'venues' },
        { selector: '#format-options', key: 'formats' },
        { selector: '#language-options', key: 'languages' },
        { selector: '#time-options', key: 'timeBands' }
    ];

    filterGroups.forEach(({ selector, key }) => {
        const container = document.querySelector(selector);

        if (!container) {
            console.error('Filter container not found:', selector);
            return;
        }

        container.addEventListener('change', async (event) => {
            
            if (!event.target.matches('input[type="checkbox"]')) return;

            const value = event.target.value;

            if (event.target.checked) {
                if (!selectedFilters[key].includes(value)) {
                    selectedFilters[key].push(value);
                }
            } else {
                selectedFilters[key] = selectedFilters[key].filter(
                    item => item !== value
                );
            }

            await loadFilteredSessions();
        });
    });
}

function updateActiveFiltersCount() {
    const count =
        selectedFilters.venues.length +
        selectedFilters.formats.length +
        selectedFilters.languages.length +
        selectedFilters.timeBands.length +
        (selectedFilters.date ? 1 : 0);

    document.querySelector('#active-filters-count').textContent = count;
}

function getLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function renderDates() {
   const dateOptions = document.querySelector('#date-options');
    const dates = [];

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + i);
        dates.push(currentDate);
    }

    selectedFilters.date = getLocalDate(dates[0]);

    dateOptions.innerHTML = dates.map((currentDate, index) => {
        const day = currentDate
            .toLocaleDateString('en-US', { weekday: 'short' })
            .toUpperCase();

        return `
            <button
                class="date-card ${index === 0 ? 'active' : ''}"
                data-date="${getLocalDate(currentDate)}"
            >
                <span>${day}</span>
                <span>${currentDate.getDate()}</span>
            </button>
        `;
    }).join('');
}

function setupDateButtons() {
    const dateOptions = document.querySelector('#date-options');

    dateOptions.addEventListener('click', async (event) => {
        const button = event.target.closest('.date-card');

        if (!button) return;

        dateOptions.querySelectorAll('.date-card').forEach(card => {
            card.classList.remove('active');
        });

        button.classList.add('active');
        selectedFilters.date = button.dataset.date;

        await loadFilteredSessions();
    });
}


export async function fetchSessions(page = 1, sort = 'time_asc') {
    const params = new URLSearchParams();

    params.set('page', page);
    params.set('sort', sort);

    if (selectedFilters.date) {
        params.set('date', selectedFilters.date);
    }

    selectedFilters.venues.forEach(value => {
        params.append('venues[]', value);
    });

    selectedFilters.formats.forEach(value => {
        params.append('formats[]', value);
    });

    selectedFilters.languages.forEach(value => {
        params.append('languages[]', value);
    });

    selectedFilters.timeBands.forEach(value => {
        params.append('bands[]', value);
    });
    
    const response = await fetch(
        `https://api.kinoxii.redberryinternship.ge/api/sessions?${params.toString()}`
    );


    if (!response.ok) {
        throw new Error(`Sessions request failed: ${response.status}`);
    }

    const data = await response.json();

    return data;
}

async function loadFilteredSessions() {
    try {
        const data = await fetchSessions(1, selectedSort);

        renderSessions(data);
        updateActiveFiltersCount();
    } catch (error) {
        console.error('Failed to load filtered sessions:', error);
    }
}


let currentPage = 1;
let lastPage = 1;
let selectedSort = 'time_asc';

const selectedFilters = {
    venues: [],
    date: '',
    formats: [],
    languages: [],
    timeBands: []
};

function renderSessions(data) {
    currentPage = data.meta.currentPage;
    lastPage = data.meta.lastPage;

    const sessionsList = document.querySelector('#sessions-list');

    document.querySelector('#sessions-count').textContent = `
        Showing ${data.meta.totalSessions} sessions
    `;

    sessionsList.innerHTML = data.data.map(item => {
        const movie = item.movie;

        return `
            <div class="session-movie">
                <div class="sessions-movie-poster">

                    <img src="${movie.posterUrl}" alt="${movie.title}">
                    <div class="sessions-movie-details">
                        <div class="sessions-movie-info">
                            <h3>${movie.title}</h3>
                            <span>${movie.ageRating.code}</span>
                            
                        </div>
                        
                        <div class="sessions-movie-duration">
                            <p>${movie.runtimeMinutes} min</p>
                        </div>
                    </div>
                </div>

                <div class="sessions-times">

                    ${item.sessions.map(session => `
                        <button class="session-time ${session.isSoldOut === true ? 'unavailable' : ''}"
                                ${session.isSoldOut ? 'disabled' : ''}
                        >
                            <div class="time-and-format">
                                <h3>${session.time}</h3>
                                <span>${session.format.name}</span>
                            </div>

                            <div class="subtitles-and-hall">
                                <p id="subtitles-name">${session.language.name}</p>
                                <p id="venue-name">${session.hall.venue.name} · Hall ${session.hall.name}</p>
                            </div>

                            <div class="tickets-and-price">
                                <p class="${session.seatsLeft < 10 ? 'tickets-low' : 'tickets-available'}">
                                <i class="fa-solid fa-ticket-simple"></i> ${session.seatsLeft}
                                </p>
                                <h3>₾${session.price}</h3>
                            </div>
                        </button>
                    `).join('')}

                </div>
            </div>
        `
    }).join('');

    renderPagination();
}


function renderPagination() {
    const pagination = document.querySelector('#sessions-pagination');
    const totalPages = lastPage;

    if(lastPage <= 1) {
        pagination.innerHTML = '';
        return;
    }

    pagination.innerHTML = `
        <button class="pagination-prev" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-left"></i>
        </button>

        ${Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            return `
                <button class="pagination-number ${page === currentPage ? 'active' : ''}"
                        data-page="${page}">
                    ${page}
                </button>
            `;
        }).join('')}

        <button class="pagination-next" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;

    pagination.querySelectorAll('.pagination-number').forEach(button => {
        button.addEventListener('click', async () => {
            const page = Number(button.dataset.page);

            const data = await fetchSessions(page, selectedSort);
            renderSessions(data);
        });
    });

    pagination.querySelector('.pagination-prev').addEventListener('click', async () => {
        if (currentPage > 1) {
            const data = await fetchSessions(currentPage - 1, selectedSort);
            renderSessions(data);
        }
    });

    pagination.querySelector('.pagination-next').addEventListener('click', async () => {
        if (currentPage < totalPages) {
            const data = await fetchSessions(currentPage + 1, selectedSort);
            renderSessions(data);
        }
    });
}

function renderSortOptions(sorts) {
    const sortSelect = document.querySelector('#sessions-sort');

    sortSelect.innerHTML = `
        <option value="time_asc">Showtime: Earliest first</option>
        <option value="time_desc">Showtime: Latest first</option>
        <option value="price_asc">Showprice: Low to high</option>
        <option value="price_desc">Showprice: High to low</option>
        <option value="title_asc">Showtitle: A–Z</option>
    `;
}


export async function setupSessionsPage() {
    setupSearch();

    const filterOptions = await fetchFilterOptions();

    renderVenues(filterOptions);
    renderDates();
    renderFormats(filterOptions);
    renderLanguages(filterOptions);
    renderTimeBands(filterOptions);
    renderSortOptions(filterOptions.sorts);

    setupDateButtons();
    setupCheckboxFilters();

    const sortSelect = document.querySelector('#sessions-sort');

    selectedSort = sortSelect.value || 'time_asc';

    const sessionsData = await fetchSessions(1, selectedSort);
    renderSessions(sessionsData);

    updateActiveFiltersCount();

    sortSelect.addEventListener('change', async () => {
        selectedSort = sortSelect.value;

        currentPage = 1;

        const data = await fetchSessions(1, selectedSort);
        renderSessions(data);
    });
}