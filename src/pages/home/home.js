import { renderHeader, setupSearch } from './header/header.js';
import { setupHero } from './hero/hero.js';
import { setupNowPlaying } from './now-playing/now-playing.js';
import { setupComingSoon } from './coming-soon/coming-soon.js';

export function renderHomePage() {
    return `
        ${renderHeader()}
    `
}

export async function setupHomePage() {
    setupSearch();
    setupHero();

    await setupNowPlaying();

    app.innerHTML += `
        <div class="section-divider"></div>
    `;

    await setupComingSoon();
}