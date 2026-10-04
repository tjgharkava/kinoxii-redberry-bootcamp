import {
    renderHomePage,
    setupHomePage
} from './pages/home/home.js';

const app = document.querySelector('#app');

app.innerHTML = renderHomePage();

setupHomePage();