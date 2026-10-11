import { renderHeader, setupSearch } from './header/header.js';
import { setupHero } from './hero/hero.js';
import { setupNowPlaying } from './now-playing/now-playing.js';
import { setupComingSoon } from './coming-soon/coming-soon.js';
import { renderFooter } from './footer/footer.js';

export function renderHomePage() {
    return `
        ${renderHeader()}

        <main>
            <section id="hero"></section>
            <section id="now-playing"></section>
            <div class="section-divider"></div>
            <section id="coming-soon"></section>
            <div class="section-divider"></div>
        </main>

        ${renderFooter()}
    `;
}

export async function setupHomePage() {
    setupHero();
    await setupNowPlaying();
    await setupComingSoon();
    setupSearch();
}