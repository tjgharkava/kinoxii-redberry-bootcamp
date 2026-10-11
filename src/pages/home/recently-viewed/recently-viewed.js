import './recently-viewed.css';
import { isLoggedIn } from '../../auth/auth.js'

const KEY = 'recentlyViewed';
const MAX_ITEMS = 4;

export function addRecentlyViewed(movie) {
    const list = getRecentlyViewed().filter(item => item.slug !== movie.slug);

    list.unshift({
        slug: movie.slug,
        title: movie.title,
        posterUrl: movie.posterUrl,
        genre: movie.genres?.[0]?.name ?? '',
        runtimeMinutes: movie.runtimeMinutes,
        ageRating: movie.ageRating?.code ?? ''
    });

    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
}

function getRecentlyViewed() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
        return [];
    }
}

export function setupRecentlyViewed() {
    const slot = document.querySelector('#recently-viewed');
    const items = getRecentlyViewed();

    if (!slot) return;

    if (!isLoggedIn() || items.length === 0) {
        slot.remove();
        return;
    }

    slot.innerHTML = `
        <div class="recently-viewed">
            <h2>Recently viewed</h2>
            <div class="recently-viewed-list">
                ${items.map(item => `
                    <a class="recently-viewed-card" href="#movie/${item.slug}">
                        <img src="${item.posterUrl}" alt="${item.title}">
                        <div class="recently-viewed-info">
                            <h3>${item.title}</h3>
                            <p>${item.genre} · ${item.runtimeMinutes} min</p>
                            <span>${item.ageRating}</span>
                        </div>
                    </a>
                `).join('')}
            </div>
        </div>
    `;
}