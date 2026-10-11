import './register.css'

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

async function registerUser({ username, email, password, passwordConfirmation, avatar }) {
    const formData = new FormData();

    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('password_confirmation', passwordConfirmation);

    if (avatar) {
        formData.append('avatar', avatar);
    }

    const response = await fetch('https://api.kinoxii.redberryinternship.ge/api/register', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
    });

    const result = await response.json();

    if (!response.ok) {
        const error = new Error(result.message || 'Registration failed');
        error.status = response.status;
        error.errors = result.errors || {};
        throw error;
    }

    return result.data;
}

export function renderRegisterModal() {
    return `
        <dialog id="register-modal" class="auth-modal">
            <button type="button" class="auth-modal-close" id="register-close" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <form id="register-form" novalidate>
                <div class="auth-title">
                    <h2>Sign up</h2>
                    <p>Welcome to Kino XII</p>
                </div>

                <div class="avatar-upload">
                    <label for="register-avatar" class="avatar-upload-btn">
                        <i class="fa-solid fa-arrow-up-from-bracket"></i>
                    </label>
                    <input type="file" id="register-avatar" name="avatar" accept=".jpg,.jpeg,.png,.webp" hidden>

                    <div class="avatar-upload-text">
                        <h3>Upload avatar (optional)</h3>
                        <p id="avatar-file-name">JPG, PNG or WEBP</p>
                    </div>
                </div>
                <small class="field-error" data-error-for="avatar"></small>

                <div class="auth-field">
                    <label for="register-username">Username</label>
                    <input type="text" id="register-username" name="username" placeholder="User">
                    <small class="field-error" data-error-for="username"></small>
                </div>

                <div class="auth-field">
                    <label for="register-email">Email</label>
                    <input type="email" id="register-email" name="email" placeholder="example@gmail.com">
                    <small class="field-error" data-error-for="email"></small>
                </div>

                <div class="auth-row">
                    <div class="auth-field">
                        <label for="register-password">Password</label>
                        <input type="password" id="register-password" name="password" placeholder="••••••••">
                        <small class="field-error" data-error-for="password"></small>
                    </div>

                    <div class="auth-field">
                        <label for="register-password-confirmation">Confirm password</label>
                        <input type="password" id="register-password-confirmation" name="password_confirmation" placeholder="••••••••">
                        <small class="field-error" data-error-for="password_confirmation"></small>
                    </div>
                </div>

                <small class="field-error" id="register-general-error"></small>

                <button type="submit" id="register-submit" disabled>Sign up</button>

                <p class="auth-switch">
                    Already have an account? <button type="button" id="switch-to-login">Log in</button>
                </p>
            </form>
        </dialog>
    `;
}

function clearErrors(form) {
    form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

function showErrors(form, errors) {
    Object.entries(errors).forEach(([field, messages]) => {
        const el = form.querySelector(`[data-error-for="${field}"]`);
        (el || form.querySelector('#register-general-error')).textContent = messages[0];
    });
}

export function setupRegisterModal() {
    const modal = document.querySelector('#register-modal');
    const openBtn = document.querySelector('#signup-open');
    const closeBtn = document.querySelector('#register-close');
    const form = document.querySelector('#register-form');

    if (!modal || !openBtn || !form) return;

    const submitButton = form.querySelector('#register-submit');
    const avatarInput = form.querySelector('#register-avatar');
    const avatarFileName = form.querySelector('#avatar-file-name');

    function updateSubmitState() {
        const filled = ['username', 'email', 'password', 'password_confirmation']
            .every(name => form.elements[name].value.trim() !== '');

        submitButton.disabled = !filled;
    }

    form.addEventListener('input', updateSubmitState);

    avatarInput.addEventListener('change', () => {
        avatarFileName.textContent = avatarInput.files[0]?.name ?? 'JPG, PNG or WEBP';
    });

    modal.addEventListener('close', () => {
        avatarFileName.textContent = 'JPG, PNG or WEBP';
        updateSubmitState();
    });

    openBtn.addEventListener('click', () => modal.showModal());

    closeBtn.addEventListener('click', () => modal.close());

    form.querySelector('#switch-to-login').addEventListener('click', () => {
        modal.close();
        document.querySelector('#login-modal')?.showModal();
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) modal.close();
    });

    modal.addEventListener('close', () => {
        form.reset();
        clearErrors(form);
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearErrors(form);

        const formData = new FormData(form);
        const avatar = formData.get('avatar');
        const hasAvatar = avatar && avatar.size > 0;

        const errors = {};

        if (formData.get('password') !== formData.get('password_confirmation')) {
            errors.password_confirmation = ['Passwords do not match'];
        }
        if (hasAvatar && !ALLOWED_TYPES.includes(avatar.type)) {
            errors.avatar = ['Only jpg, jpeg, png or webp allowed'];
        } else if (hasAvatar && avatar.size > MAX_AVATAR_SIZE) {
            errors.avatar = ['Avatar must be 2MB or less'];
        }

        if (Object.keys(errors).length) {
            showErrors(form, errors);
            return;
        }

        const submitButton = form.querySelector('#register-submit');
        submitButton.disabled = true;

        try {
            const { user, token } = await registerUser({
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password'),
                passwordConfirmation: formData.get('password_confirmation'),
                avatar: hasAvatar ? avatar : null
            });

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            modal.close();

            if (!user.profileComplete) {
                window.location.hash = '#profile';
            }

            window.location.reload();

        } catch (error) {
            if (error.status === 422) {
                showErrors(form, error.errors);
            } else {
                form.querySelector('#register-general-error').textContent =
                    'Something went wrong. Please try again.';
                console.error(error);
            }
        } finally {
            submitButton.disabled = false;
        }
    });
}