
import { renderHomePage, setupHomePage } from './pages/home/home.js';
import { renderSessionsPage, setupSessionsPage } from './pages/sessions/sessions.js';
import {
    renderMovieDetailsPage,
    setupMovieDetailsPage
} from './pages/movie-details/movie-details.js';
import { renderProfilePage, setupProfilePage } from './pages/profile/profile.js';

const app = document.querySelector('#app');

app.addEventListener('click', event => {
    const movieCard = event.target.closest('.movie-card');

    if (!movieCard) return;

    const slug = movieCard.dataset.slug;

    if (slug) {
        window.location.hash = `#movie/${slug}`;
    }
});

async function renderPage() {
    const hash = window.location.hash;

    if (hash.startsWith('#movie/')) {
        const slug = hash.slice('#movie/'.length);

        if (!slug) {
            window.location.hash = '';
            return;
        }

        app.innerHTML = renderMovieDetailsPage();
        await setupMovieDetailsPage(slug);
        return;
    }

    if (hash === '#sessions') {
        app.innerHTML = renderSessionsPage();
        setupSessionsPage();
        return;
    }

    if (hash === '#profile') {
    app.innerHTML = renderProfilePage();
    await setupProfilePage();
    return;
}

    app.innerHTML = renderHomePage();
    await setupHomePage();
}

renderPage();

window.addEventListener('hashchange', renderPage);
