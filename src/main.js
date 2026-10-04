import {
    renderHomePage,
    setupHomePage
} from './pages/home/home.js';
// import './pages/home/now-playing/now-playing.js';

const app = document.querySelector('#app');

app.innerHTML = renderHomePage();

setupHomePage();