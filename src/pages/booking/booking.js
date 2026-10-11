import './booking.css';
import { authFetch, getToken, isLoggedIn, getUser } from '../auth/auth.js';

const API_URL = 'https://api.kinoxii.redberryinternship.ge/api';
const MAX_SEATS = 3;

let seatMap = null;
let selected = new Map(); 
let currentSession = null;

async function fetchSeatMap(sessionId) {
    const fetcher = getToken() ? authFetch : fetch;
    const response = await fetcher(`${API_URL}/sessions/${sessionId}/seats`, {
        headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error('Failed to load seat map');

    const result = await response.json();
    return result.data;
}

function renderSeat(seat) {
    
    if (seat.state === 'unavailable') {
        return `<span class="seat-gap"></span>`;
    }

    const isSelected = selected.has(seat.id);
    const classes = ['seat', seat.state];
    if (isSelected) classes.push('selected');

    const clickable = seat.state === 'available';

    return `
        <button type="button"
                class="${classes.join(' ')}"
                data-seat-id="${seat.id}"
                data-seat-code="${seat.code}"
                ${clickable ? '' : 'disabled'}>
            ${seat.label}
        </button>
        ${seat.aisleAfter ? '<span class="aisle"></span>' : ''}
    `;
}

function renderSeatMap() {
    const container = document.querySelector('#seat-map');

    container.innerHTML = seatMap.sections.map(section => `
        <div class="seat-section">
            <h4 class="seat-section-title">${section.name}</h4>

            ${section.rows.map(row => `
                <div class="seat-row">
                    <span class="row-label">${row.label}</span>
                    <div class="row-seats">
                        ${row.seats.map(renderSeat).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

function renderSummary() {
    const list = document.querySelector('#selected-seats');
    const subtotal = document.querySelector('#subtotal');
    const nextBtn = document.querySelector('#next-checkout');

    const items = [...selected.values()];

    list.innerHTML = items.map(item => `
        <div class="selected-seat-item">
            <span>Seat ${item.code}</span>
        </div>
    `).join('');

    const total = items.length * (currentSession?.price ?? 0);
    subtotal.textContent = `₾${total}`;

    nextBtn.disabled = items.length === 0;
}

function toggleSeat(button) {
    const id = Number(button.dataset.seatId);
    const code = button.dataset.seatCode;

    if (selected.has(id)) {
        selected.delete(id);
        button.classList.remove('selected');
    } else {
        if (selected.size >= MAX_SEATS) return;
        selected.set(id, { id, code });
        button.classList.add('selected');
    }

    renderSummary();
}

export function renderBookingModal() {
    return `
        <dialog id="booking-modal" class="booking-modal">
            <div class="booking-header">
                <div>
                    <h2 id="booking-title"></h2>
                    <p id="booking-meta"></p>
                </div>
                <button type="button" id="booking-close" aria-label="Close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div class="booking-body">
                <div class="booking-left">
                    <div class="booking-steps">
                        <button type="button" class="booking-step active">Seats</button>
                        <button type="button" class="booking-step" disabled>Checkout</button>
                    </div>

                    <div class="screen">SCREEN</div>

                    <div id="seat-map" class="seat-map"></div>

                    <div class="seat-legend">
                        <span><i class="legend-box available"></i> Available</span>
                        <span><i class="legend-box selected"></i> Selected</span>
                        <span><i class="legend-box sold"></i> Sold</span>
                        <span><i class="legend-box held"></i> Held by another user</span>
                    </div>
                </div>

                <aside class="booking-right">
                    <h3>Your seats · Max ${MAX_SEATS}</h3>
                    <p class="booking-hint">Pick up to ${MAX_SEATS} seats from the map.</p>

                    <div id="selected-seats"></div>

                    <div class="booking-total">
                        <span>SUBTOTAL</span>
                        <strong id="subtotal">₾0</strong>
                    </div>

                    <button type="button" id="next-checkout" class="booking-next" disabled>
                        Next: Checkout
                    </button>
                </aside>
            </div>
        </dialog>
    `;
}

export async function openBooking(session, movieTitle) {
    const modal = document.querySelector('#booking-modal');
    if (!modal) return;

    if (!isLoggedIn()) {
        document.querySelector('#login-modal')?.showModal();
        return;
    }
    if (!getUser().profileComplete) {
        window.location.hash = '#profile';
        return;
    }

    currentSession = session;
    selected = new Map();

    document.querySelector('#booking-title').textContent = movieTitle;
    document.querySelector('#booking-meta').textContent =
        `${session.hall.venue.name} · Hall ${session.hall.name} · ${session.time} · ${session.format.name}`;

    modal.showModal();

    const container = document.querySelector('#seat-map');
    container.innerHTML = '<p>Loading seats...</p>';
    renderSummary();

    try {
        seatMap = await fetchSeatMap(session.id);

        seatMap.sections.forEach(section =>
            section.rows.forEach(row =>
                row.seats.forEach(seat => {
                    if (seat.isMine) selected.set(seat.id, { id: seat.id, code: seat.code });
                })
            )
        );

        renderSeatMap();
        renderSummary();
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Could not load seats. Please try again.</p>';
    }
}

export function setupBookingModal() {
    const modal = document.querySelector('#booking-modal');
    if (!modal) return;

    document.querySelector('#booking-close').addEventListener('click', () => modal.close());

    modal.addEventListener('click', event => {
        if (event.target === modal) modal.close();
    });

    document.querySelector('#seat-map').addEventListener('click', event => {
        const button = event.target.closest('.seat');
        if (!button || button.disabled) return;
        toggleSeat(button);
    });
}