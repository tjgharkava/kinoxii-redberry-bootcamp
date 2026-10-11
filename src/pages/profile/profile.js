import './profile.css';
import { renderHeader, setupSearch } from '../home/header/header.js';
import { renderFooter } from '../home/footer/footer.js';
import { isLoggedIn, getUser, authFetch } from '../auth/auth.js';

const API_URL = 'https://api.kinoxii.redberryinternship.ge/api';
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

async function fetchVenues() {
    try {
        const response = await fetch(`${API_URL}/filter-options`);
        const result = await response.json();
        return result.data.venues ?? [];
    } catch (error) {
        console.error('Venues load failed:', error);
        return [];
    }
}

export function renderProfilePage() {
    return `
        ${renderHeader()}

        <main class="profile-page">
            <div class="profile-wrapper" id="profile-wrapper"></div>
        </main>

        ${renderFooter()}
    `;
}

function renderEligibility(user) {
    if (user.age === null || user.age === undefined) return '';

    return `
        <div class="eligibility-note">
            You are ${user.age}, ${user.age >= 18
                ? 'you can buy tickets for all age ratings'
                : 'some age ratings may be unavailable to you'}
        </div>
    `;
}

function renderProfileForm(user, venues) {
    const wrapper = document.querySelector('#profile-wrapper');
    const selectedVenueId = user.preferredVenue?.id ?? '';

    wrapper.innerHTML = `
        <h1>My Profile</h1>

        <div class="profile-tabs">
            <button type="button" class="profile-tab active">Personal Information</button>
            <button type="button" class="profile-tab">
                My Tickets <span class="tab-badge">0</span>
            </button>
        </div>

        ${user.profileComplete
            ? `<div class="profile-banner complete">Profile Complete <i class="fa-solid fa-check"></i></div>`
            : `<div class="profile-banner incomplete">
                   <strong>Profile incomplete</strong>
                   <p>Please complete your profile to enable booking</p>
               </div>`}

        ${renderEligibility(user)}

        <form id="profile-form" novalidate>
            <div class="avatar-upload">
                <label for="profile-avatar" class="avatar-upload-btn">
                    <i class="fa-solid fa-arrow-up-from-bracket"></i>
                </label>
                <input type="file" id="profile-avatar" name="avatar" accept=".jpg,.jpeg,.png,.webp" hidden>

                <div class="avatar-upload-text">
                    <h3>Change avatar (optional)</h3>
                    <p id="profile-avatar-name">JPG, PNG or WEBP</p>
                </div>
            </div>
            <small class="field-error" data-error-for="avatar"></small>

            <div class="auth-field">
                <label for="profile-fullname">Full name</label>
                <input type="text" id="profile-fullname" name="fullName"
                       value="${user.fullName ?? ''}" placeholder="e.g. Text">
                <small class="field-error" data-error-for="fullName"></small>
            </div>

            <div class="auth-field">
                <label for="profile-email">Email</label>
                <input type="email" id="profile-email" value="${user.email}" disabled>
                <small class="field-hint">Set at registration and cannot be changed</small>
            </div>

            <div class="auth-field">
                <label for="profile-mobile">Mobile number</label>
                <input type="text" id="profile-mobile" name="mobileNumber"
                       value="${user.mobileNumber ?? ''}" placeholder="e.g. 599 123 456">
                <small class="field-error" data-error-for="mobileNumber"></small>
            </div>

            <div class="auth-field">
                <label for="profile-dob">Date of birth</label>
                <input type="date" id="profile-dob" name="dateOfBirth"
                       value="${user.dateOfBirth ?? ''}">
                <small class="field-error" data-error-for="dateOfBirth"></small>
            </div>

            <div class="auth-field">
                <label for="profile-venue">Preferred Venue (Optional)</label>
                <select id="profile-venue" name="preferredVenueId">
                    <option value="">e.g. Text</option>
                    ${venues.map(venue => `
                        <option value="${venue.id}" ${venue.id === selectedVenueId ? 'selected' : ''}>
                            ${venue.name} · ${venue.city}
                        </option>
                    `).join('')}
                </select>
                <small class="field-error" data-error-for="preferredVenueId"></small>
            </div>

            <small class="field-error" id="profile-general-error"></small>

            <button type="submit" id="profile-submit" class="profile-save-btn">Save changes</button>
        </form>
    `;
}

function showErrors(form, errors) {
    Object.entries(errors).forEach(([field, messages]) => {
        const el = form.querySelector(`[data-error-for="${field}"]`);
        (el || form.querySelector('#profile-general-error')).textContent = messages.join(' ');
    });
}

async function saveProfile(form) {
    const formData = new FormData(form);

    const avatar = formData.get('avatar');

    if (!formData.get('preferredVenueId')) {
        formData.delete('preferredVenueId');
    }

    if (!avatar || avatar.size === 0) {
        formData.delete('avatar');
    }

    const response = await authFetch(`${API_URL}/profile`, {
        method: 'PUT',
        body: formData
    });

    const result = await response.json();

    if (!response.ok) {
        const error = new Error(result.message || 'Profile update failed');
        error.status = response.status;
        error.errors = result.errors || {};
        throw error;
    }

    return result.data;
}

export async function setupProfilePage() {
    setupSearch();

    if (!isLoggedIn()) {
        window.location.hash = '';
        return;
    }

    const venues = await fetchVenues();
    renderProfileForm(getUser(), venues);

    const form = document.querySelector('#profile-form');
    const submitButton = form.querySelector('#profile-submit');
    const avatarInput = form.querySelector('#profile-avatar');

    avatarInput.addEventListener('change', () => {
        document.querySelector('#profile-avatar-name').textContent =
            avatarInput.files[0]?.name ?? 'JPG, PNG or WEBP';
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        form.querySelectorAll('.field-error').forEach(el => el.textContent = '');

        const file = avatarInput.files[0];
        if (file && !ALLOWED_TYPES.includes(file.type)) {
            showErrors(form, { avatar: ['Only jpg, jpeg, png or webp allowed'] });
            return;
        }
        if (file && file.size > MAX_AVATAR_SIZE) {
            showErrors(form, { avatar: ['Avatar must be 2MB or less'] });
            return;
        }

        submitButton.disabled = true;

        try {
            const user = await saveProfile(form);

            localStorage.setItem('user', JSON.stringify(user));
            window.location.reload(); 
        } catch (error) {
            if (error.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.hash = '';
                window.location.reload();
            } else if (error.status === 422) {
                showErrors(form, error.errors);
            } else {
                form.querySelector('#profile-general-error').textContent =
                    'Something went wrong. Please try again.';
                console.error(error);
            }
        } finally {
            submitButton.disabled = false;
        }
    });
}