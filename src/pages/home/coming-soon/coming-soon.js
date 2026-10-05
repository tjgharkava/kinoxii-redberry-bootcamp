import './coming-soon.css';

export async function setupComingSoon() {
    const response = await fetch('https://api.kinoxii.redberryinternship.ge/api/movies/coming-soon?limit=4');
    const data = await response.json();
    const movies = data.data;
    const app = document.querySelector('#app');

    app.innerHTML += `
        <section class="coming-soon">
            <div class="coming-soon-header">
                <h1>COMING SOON...</h1>
                <a href="#">See All</a>
            </div>
            

            <div class="coming-soon-container"></div>
        </section>
    `

    const comingSoonContainer = document.querySelector('.coming-soon-container');
    movies.forEach(movie => {
        comingSoonContainer.innerHTML += `
            <div class="coming-soon-card">
                <div class="coming-soon-main">
                    <img src="${movie.posterUrl}" alt="${movie.title}">
                    <div class="coming-soon-info">
                        <p id="movie-release">IN CINEMAS ${movie.releaseDate}</p>
                        <div class="coming-soon-frame-18">
                            <p id="coming-soon-title">${movie.title}</p>
                            <p id="coming-soon-duration">${movie.genres[0].name} · ${movie.runtimeMinutes} min</p>
                        </div>
                        <span>${movie.ageRating.code}</span>
                        <button class="notify-me-btn"><i class="fa-regular fa-bell"></i>Notify Me</button>
                    </div>
                </div>
            </div>
        `
    });
}