// Fonction pour vérifier si l'utilisateur est connecté
async function checkAuthentication() {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        // Mettre à jour les liens d'authentification
        updateAuthLinks(data.authenticated, data.user);
        
        return { authenticated: data.authenticated, user: data.user };
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        return { authenticated: false };
    }
}

// Mettre à jour les liens d'authentification dans le header
function updateAuthLinks(authenticated, user) {
    const authLinks = document.getElementById('auth-links');
    if (!authLinks) return;
    
    if (authenticated) {
        authLinks.innerHTML = `
            <li class="dropdown">
                <a href="#" class="dropdown-toggle">${user.name} ▾</a>
                <ul class="dropdown-menu">
                    <li><a href="/my-orders.html">Mes commandes</a></li>
                    <li><a href="#" id="logout-link">Déconnexion</a></li>
                </ul>
            </li>
        `;
        
        // Ajouter l'événement de déconnexion
        document.getElementById('logout-link').addEventListener('click', logout);
    } else {
        authLinks.innerHTML = `
            <li><a href="/login.html">Connexion</a></li>
            <li><a href="/register.html">Inscription</a></li>
        `;
    }
}

// Fonction de déconnexion
async function logout(event) {
    event.preventDefault();
    
    try {
        await fetch('/api/auth/logout', {
            method: 'POST'
        });
        
        // Rediriger vers la page d'accueil
        window.location.href = '/';
    } catch (error) {
        console.error('Erreur de déconnexion:', error);
    }
}

// Gestion du formulaire d'inscription
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const errorMessage = document.getElementById('error-message');
        
        // Vérifier que les mots de passe correspondent
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Les mots de passe ne correspondent pas';
            return;
        }
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, name, email, phone, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                errorMessage.textContent = data.message || 'Erreur lors de l\'inscription';
                return;
            }
            
            // Rediriger vers la page de connexion
            window.location.href = '/login.html?registered=true';
        } catch (error) {
            console.error('Erreur:', error);
            errorMessage.textContent = 'Une erreur s\'est produite, veuillez réessayer';
        }
    });
}

// Gestion du formulaire de connexion
const loginForm = document.getElementById('login-form');
if (loginForm) {
    // Afficher un message si l'utilisateur vient de s'inscrire
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Inscription réussie! Vous pouvez maintenant vous connecter.';
        loginForm.parentNode.insertBefore(successMessage, loginForm);
    }
    
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                errorMessage.textContent = data.message || 'Nom d\'utilisateur ou mot de passe incorrect';
                return;
            }
            
            // Rediriger vers la page d'accueil
            window.location.href = '/';
        } catch (error) {
            console.error('Erreur:', error);
            errorMessage.textContent = 'Une erreur s\'est produite, veuillez réessayer';
        }
    });
}

// Vérifier l'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', checkAuthentication);