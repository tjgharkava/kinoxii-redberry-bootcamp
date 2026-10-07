import { renderHomePage, setupHomePage } from './pages/home/home.js';
import { renderSessionsPage, setupSessionsPage } from './pages/sessions/sessions.js';

const app = document.querySelector('#app');

function renderPage() {
    const hash = window.location.hash;

    if(hash === '#sessions') {
        app.innerHTML = renderSessionsPage();
        setupSessionsPage();
        return;
    }

    app.innerHTML = renderHomePage();
    setupHomePage();
}

renderPage();

window.addEventListener('hashchange', renderPage);

