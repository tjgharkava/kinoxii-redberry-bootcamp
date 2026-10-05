import './now-playing.css'

export async function setupNowPlaying() {

    const response = await fetch('https://api.kinoxii.redberryinternship.ge/api/movies/now-playing?limit=6');
    const data = await response.json();
    const movies = data.data;
    const app = document.querySelector('#app');

    app.innerHTML += `
        <section class="now-playing">
            <div class="card-header">
                <h1>NOW PLAYING</h1>
                <a href="#">See All</a>
            </div>

            <div class="movies-container"></div>
        </section>
    `

    const moviesContainer = document.querySelector('.movies-container');
    movies.forEach(movie => {
        moviesContainer.innerHTML += `
            <div class="movie-card">
                <div class="card-main">
                    <img src="${movie.posterUrl}" alt="${movie.title}">
                    <h3>${movie.title}</h3>
                    <p class="movie-genre">${movie.genres[0].name} · ${movie.runtimeMinutes} min</p>
                    <span>${movie.ageRating.code}</span>
                    <p class="movie-synopsis">${movie.synopsis}</p>
                    <div class="purchase-frame">
                        <p>From ₾ ${movie.fromPrice}</p>
                        <button class="buy-ticket-button">Buy Ticket</button>
                    </div>
                </div>
                 
            </div>
             
        `;
    });

}