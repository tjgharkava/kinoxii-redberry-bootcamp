export function renderHomePage() {
    return `
        <header class="header">
        
            <div class="header-logo">
                <h2>KINO <span>XII</span></h2>
                <nav class="main-nav">
                    <a href="#sessions" class="active">SESSIONS</a>
                </nav>
            </div>

            <div class="header-right">
                <div class="search-box">
                <button class="search-btn"><i class="fa-solid fa-magnifying-glass"></i></button>
                    <input id="search-input" type="text" placeholder="Search films and live events">
                </div>
                <div class="auth-buttons">
                    <button class="signup-btn"><a href="#signup">Sign Up</a></button>
                    <button class="login-btn"><a href="#login">Log In</a></button>
                </div>
            </div>

        </header>
    `
}

export async function searchMovies(query) {
    const response = await fetch(
        `https://api.kinoxii.redberryinternship.ge/api/search?q=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    console.log(data);
}

export function setupSearch() {
    const input = document.getElementById('search-input');
    const button = document.querySelector('.search-btn');

    button.addEventListener('click', () => {
        searchMovies(input.value);
    })
}