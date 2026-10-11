import './register.css';

export function renderLoginModal() {
    return `
        <dialog id="login-modal" class="auth-modal">
            <button type="button" class="auth-modal-close" id="login-close" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <form id="login-form" class="auth-form" novalidate>
                <div class="auth-title">
                    <h2>Log in</h2>
                    <p>Welcome back to Kino XII</p>
                </div>

                <div class="auth-field">
                    <label for="login-email">Email</label>
                    <input type="email" id="login-email" name="email" placeholder="example@gmail.com">
                    <small class="field-error" data-error-for="email"></small>
                </div>

                <div class="auth-field">
                    <label for="login-password">Password</label>
                    <input type="password" id="login-password" name="password" placeholder="••••••••">
                    <small class="field-error" data-error-for="password"></small>
                </div>

                <small class="field-error" id="login-general-error"></small>

                <button type="submit" id="login-submit" class="auth-submit" disabled>Log in</button>

                <p class="auth-switch">
                    Don't have an account? <button type="button" id="switch-to-register">Sign up</button>
                </p>
            </form>
        </dialog>
    `;
}

async function loginUser({ email, password }) {
    const response = await fetch('https://api.kinoxii.redberryinternship.ge/api/login', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
        const error = new Error(result.message || 'Login failed');
        error.status = response.status;
        error.errors = result.errors || {};
        throw error;
    }

    return result.data;
}

function clearErrors(form) {
    form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

function showErrors(form, errors) {
    Object.entries(errors).forEach(([field, messages]) => {
        const el = form.querySelector(`[data-error-for="${field}"]`);
        (el || form.querySelector('#login-general-error')).textContent = messages[0];
    });
}

export function setupLoginModal() {
    const modal = document.querySelector('#login-modal');
    const openBtn = document.querySelector('#login-open');
    const closeBtn = document.querySelector('#login-close');
    const form = document.querySelector('#login-form');

    if (!modal || !form) return;

    const submitButton = form.querySelector('#login-submit');

    function updateSubmitState() {
        const filled = ['email', 'password']
            .every(name => form.elements[name].value.trim() !== '');

        submitButton.disabled = !filled;
    }

    if (openBtn) {
        openBtn.addEventListener('click', () => modal.showModal());
    }

    closeBtn.addEventListener('click', () => modal.close());

    modal.addEventListener('click', (event) => {
        if (event.target === modal) modal.close();
    });

    modal.addEventListener('close', () => {
        form.reset();
        clearErrors(form);
        updateSubmitState();
    });

    form.addEventListener('input', updateSubmitState);

    // Sign up მოდალზე გადართვა
    form.querySelector('#switch-to-register').addEventListener('click', () => {
        modal.close();
        document.querySelector('#register-modal')?.showModal();
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearErrors(form);

        const formData = new FormData(form);
        submitButton.disabled = true;

        try {
            const { user, token } = await loginUser({
                email: formData.get('email').trim(),
                password: formData.get('password')
            });

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            modal.close();
            window.location.reload();
        } catch (error) {
            if (error.status === 401) {
                // მოდალი ღია რჩება, email შევსებული რჩება, პაროლს ვასუფთავებთ
                form.elements.password.value = '';
                form.querySelector('#login-general-error').textContent =
                    error.message || 'Invalid credentials.';
            } else if (error.status === 422) {
                showErrors(form, error.errors);
            } else {
                form.querySelector('#login-general-error').textContent =
                    'Something went wrong. Please try again.';
                console.error(error);
            }
        } finally {
            updateSubmitState();
        }
    });
}