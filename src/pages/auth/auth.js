export function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

export function getToken() {
    return localStorage.getItem('token');
}

export function isLoggedIn() {
    return Boolean(getToken() && getUser());
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
}

export function authFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: {
            'Accept': 'application/json',
            ...(options.headers || {}),
            'Authorization': `Bearer ${getToken()}`
        }
    });
}