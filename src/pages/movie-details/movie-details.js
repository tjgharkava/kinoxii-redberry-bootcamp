
import './movie-details.css';
import { renderHeader, setupSearch } from '../home/header/header.js';
import { renderFooter } from '../home/footer/footer.js';

const API_URL = 'https://api.kinoxii.redberryinternship.ge/api';

export async function fetchMovie(slug) {
    const response = await fetch(`${API_URL}/movies/${slug}`);

    if (!response.ok) {
        throw new Error('Failed to load movie details');
    }

    const result = await response.json();
    return result.data;
}

export async function fetchMovieSessions(slug, date) {
    const response = await fetch(
        `${API_URL}/movies/${slug}/sessions?date=${date}`
    );

    if (!response.ok) {
        throw new Error('Failed to load sessions');
    }

    const result = await response.json();
    return result.data;
}


export function renderMovieDetailsPage() {
    return `
        ${renderHeader()}

        <main class="movie-details-page">

            <div class="movie-details-hero">
                <section class="movie-details-banner" id="movie-details-banner"></section>

                <section class="movie-details-content" id="movie-details-content">
                    <p>Loading movie details...</p>
                </section>
            </div>

            <div class="movie-bottom-layout">

                <section class="movie-sessions-section">
                    <h2>Sessions</h2>

                    <div class="movie-sessions-container">
                        <div id="movie-dates" class="movie-dates"></div>

                        <div id="movie-session-list">
                            <p>Select a date to see sessions.</p>
                        </div>
                    </div>
                </section>

                <section class="movie-additional-details">
                    <h2>Details</h2>
                    <div id="movie-extra-details"></div>
                </section>

            </div>

        </main>

        ${renderFooter()}
    `;
}


export async function setupMovieDetailsPage(slug) {
    setupSearch();

    const container = document.querySelector('#movie-details-content');

    try {
        const movie = await fetchMovie(slug);
        console.log('MOVIE DETAILS: ', movie);
        const banner = document.querySelector('.movie-details-banner');

        banner.style.backgroundImage = `url("${movie.backdropUrl}")`;

        container.innerHTML = `
            <div class="movie-details-info">
                <img
                    class="movie-details-poster"
                    src="${movie.posterUrl}"
                    alt="${movie.title}"
                >

                <div class="movie-details-text">
                    <span class="movie-status">
                        ${movie.isComingSoon ? 'COMING SOON' : 'NOW PLAYING'}
                    </span>
                    <div class="movie-info">
                        <h1>${movie.title}</h1>
                        <p class="movie-synopsis">${movie.synopsis ?? 'No description available.'}</p>

                        <div class="movie-frame">
                            <span>${movie.ageRating.code}</span>
                            <span>${movie.runtimeMinutes}</span>
                            <span>${movie.formats?.map(format => format.name).join(' · ') ?? ''}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        renderMovieDates(movie.availableDates ?? [], slug);

        const extraDetails = document.querySelector('#movie-extra-details');

        extraDetails.innerHTML = `
            <div class="extra-detail">
                <span class="extra-detail-label">DIRECTOR</span>
                <span class="extra-detail-value">${movie.director ?? 'N/A'}</span>
            </div>

            <div class="extra-detail">
                <span class="extra-detail-label">CAST</span>
                <span class="extra-detail-value">${movie.cast ?? 'N/A'}</span>
            </div>

            <div class="extra-detail">
                <span class="extra-detail-label">DURATION</span>
                <span class="extra-detail-value">${movie.runtimeMinutes} min</span>
            </div>

            <div class="extra-detail">
                <span class="extra-detail-label">RELEASE DATE</span>
                <span class="extra-detail-value">
                    ${movie.releaseDate
                        ? new Date(`${movie.releaseDate}T00:00:00`).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        })
                        : 'N/A'}
                </span>
            </div>

            <div class="extra-detail">
                <span class="extra-detail-label">FORMATS</span>
                <span class="extra-detail-value">
                    ${movie.formats?.map(format => format.name).join(', ') || 'N/A'}
                </span>
            </div>

            <div class="extra-detail">
                <span class="extra-detail-label">PRICE FROM</span>
                <span class="extra-detail-value">₾${movie.fromPrice ?? 'N/A'}</span>
            </div>

            <div class="rating-note">
                <span>RATING NOTE</span>
                <div class="rating-code-text">
                    <span>${movie.ageRating.code}</span>
                    <p>${movie.ageRating.description}</p>
                </div>
            </div>
        `

    } catch (error) {
        console.error('Movie details error:', error);

        container.innerHTML = `
            <h1>Movie not found</h1>
            <p>Could not load movie details.</p>
            <a href="#">Go back home</a>
        `;
    }
}

function renderMovieDates(availableDates, slug) {
    const datesContainer = document.querySelector('#movie-dates');
    const sessionsContainer = document.querySelector('#movie-session-list');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);
        return date;
    });

    datesContainer.innerHTML = dates.map(date => {
        const dateString = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0')
        ].join('-');

        const available = availableDates.includes(dateString);

        return `
            <button
                class="movie-date-button"
                data-date="${dateString}"
                ${available ? '' : 'disabled'}
            >
                <span>
                    ${date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <strong>${date.getDate()}</strong>
            </button>
        `;
    }).join('');

    datesContainer.addEventListener('click', async event => {
        const button = event.target.closest('.movie-date-button');

        if (!button || button.disabled) return;

        datesContainer.querySelectorAll('.movie-date-button')
            .forEach(dateButton => dateButton.classList.remove('active'));

        button.classList.add('active');
        sessionsContainer.innerHTML = '<p>Loading sessions...</p>';

        try {
            const venues = await fetchMovieSessions(slug, button.dataset.date);
            renderSessions(venues, sessionsContainer);
        } catch (error) {
            console.error('Sessions error:', error);
            sessionsContainer.innerHTML = '<p>Could not load sessions. Please try again.</p>';
        }
    });

    const firstAvailableDate = datesContainer.querySelector(
        '.movie-date-button:not(:disabled)'
    );

    if (firstAvailableDate) {
        firstAvailableDate.click();
    } else {
        sessionsContainer.innerHTML = '<p>No upcoming sessions available.</p>';
    }
}

function renderSessions(venues, container) {
    if (!venues || venues.length === 0) {
        container.innerHTML = '<p>No sessions available for this date.</p>';
        return;
    }

    container.innerHTML = venues.map(group => `
        <section class="session-venue">
            <h3>${group.venue.name}</h3>

            <div class="session-buttons">
                ${group.sessions.map(session => `
                    <div class="one-session">
                        <div class="hall-name">Hall ${session.hall.name}</div>

                        <button
                            class="session-button"
                            ${session.isSoldOut || session.seatsLeft === 0 ? 'disabled' : ''}
                            title="${session.language.name}"
                        >
                            <div class="ticket-left">
                                <h2>${session.time}</h2>
                                <div class="language-and-format">
                                    <span class="language">${session.language.code}</span>
                                    <span class="format">${session.format.name}</span>
                                </div>
                            </div>

                            <div class="ticket-right">
                                <strong>₾${session.price}</strong>
                                <span>${session.seatsLeft} seats left</span>
                                ${session.isSoldOut ? '<span>Sold out</span>' : ''}
                            </div>
  
                        </button>
                    </div>
                `).join('')}
            </div>
        </section>
    `).join('');
}
