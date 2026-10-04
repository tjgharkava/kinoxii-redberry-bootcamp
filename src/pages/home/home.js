import { renderHeader, setupSearch } from './header/header.js';
import { setupHero } from './hero/hero.js';
import { setupNowPlaying } from './now-playing/now-playing.js';

export function renderHomePage() {
    return `
        ${renderHeader()}
    `
}

export function setupHomePage() {
    setupSearch();
    setupNowPlaying();
    setupHero();
}