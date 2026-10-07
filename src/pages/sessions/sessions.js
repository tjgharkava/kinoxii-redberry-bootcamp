import './sessions.css'
import { renderHeader, setupSearch } from '../../pages/home/header/header.js';

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
            <div>
                <section></section>
            </div>
            
        </main>
    `
}

export async function fetchSessions() {
    const response = await fetch('https://api.kinoxii.redberryinternship.ge/api/sessions');

    const data = await response.json();

    return data;
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

    console.log(filterOptions.venues);

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

export async function setupSessionsPage() {
    setupSearch();

    const filterOptions = await fetchFilterOptions();

    renderVenues(filterOptions);
    renderFormats(filterOptions);
    renderLanguages(filterOptions);
    renderTimeBands(filterOptions);
}