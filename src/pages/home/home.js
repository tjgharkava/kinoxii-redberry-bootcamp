import { renderHeader, setupSearch } from './header.js';
import { setupHero } from './hero';

export function renderHomePage() {
    return `
        ${renderHeader()};

    `
}

export function setupHomePage() {
    setupSearch();
    setupHero();
}