// auth.js - Authentication handling

// Get API Configuration with CORS proxy support
const getAuthApiUrl = () => {
    const baseUrl = window.CONFIG?.AUTH_API_URL || 'https://platform.zone01.gr/api/auth/signin';
    if (window.CONFIG?.USE_CORS_PROXY && window.CONFIG?.CORS_PROXY) {
        return window.CONFIG.CORS_PROXY + encodeURIComponent(baseUrl);
    }
    return baseUrl;
};

// Utility function to encode credentials in base64
function encodeCredentials(username, password) {
    const credentials = `${username}:${password}`;
    return btoa(credentials);
}

// Function to store JWT token
function storeToken(token) {
    localStorage.setItem('jwt_token', token);
}

// Function to get JWT token
function getToken() {
    return localStorage.getItem('jwt_token');
}

// Function to remove JWT token
function removeToken() {
    localStorage.removeItem('jwt_token');
}

// Function to check if user is authenticated
function isAuthenticated() {
    const token = getToken();
    return token !== null && token !== '';
}

async function login(username, password) {
    try {
        const encodedCredentials = encodeCredentials(username, password);
        
        const response = await fetch(getAuthApiUrl(), {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Login response:', data);

            // If the response is a string, use it directly as the token
            let token = null;
            if (typeof data === 'string') {
                token = data;
            } else if (data.token || data.jwt || data.access_token) {
                token = data.token || data.jwt || data.access_token;
            }

            if (token) {
                storeToken(token);
                console.log(token)
                return { success: true, token };
            } else {
                return { success: false, error: 'No token received from server' };
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            return { 
                success: false, 
                error: errorData.message || `Login failed: ${response.status} ${response.statusText}` 
            };
        }
    } catch (error) {
        return { 
            success: false, 
            error: `Network error: ${error.message}` 
        };
    }
}

// Function to logout
function logout() {
    removeToken();
    window.location.href = 'index.html';
}

// Check authentication on page load for protected pages
function checkAuthOnLoad() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

// Login form handler (only runs on login page)
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('error-message');
        
        // Clear previous error messages
        errorElement.textContent = '';
        
        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Logging in...';
        submitButton.disabled = true;
        
        try {
            const result = await login(username, password);
            
            if (result.success) {
                // Redirect to profile page
                window.location.href = 'profile.html';
            } else {
                errorElement.textContent = result.error;
            }
        } catch (error) {
            errorElement.textContent = 'An unexpected error occurred. Please try again.';
        } finally {
            // Restore button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// Logout button handler (only runs on pages with logout button)
if (document.getElementById('logout-btn')) {
    document.getElementById('logout-btn').addEventListener('click', logout);
}

// Auto-redirect if already logged in (only on login page)
if (document.getElementById('loginForm') && isAuthenticated()) {
    window.location.href = 'profile.html';
}
