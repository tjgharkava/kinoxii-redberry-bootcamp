import {
    renderHomePage,
    setupSearch,
    setupHero
} from './pages/home.js';

import './pages/home.css';

const app = document.querySelector('#app');

app.innerHTML = renderHomePage();

setupSearch();
setupHero();