// Variables pour le panier
let cart = [];
let currentUser = null;

// Charger le panier depuis le localStorage
function loadCart() {
    const savedCart = localStorage.getItem('mirebCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
        updateCartCount();
    }
}

// Sauvegarder le panier dans le localStorage
function saveCart() {
    localStorage.setItem('mirebCart', JSON.stringify(cart));
    updateCartCount();
}

// Mettre à jour l'affichage du panier
function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const checkoutSection = document.getElementById('checkout-section');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const loginRequiredMessage = document.getElementById('login-required-message');
    
    if (!cartItems) return;
    
    // Vérifier si le panier est vide
    if (cart.length === 0) {
        cartItems.style.display = 'none';
        cartSummary.style.display = 'none';
        checkoutSection.style.display = 'none';
        emptyCartMessage.style.display = 'block';
        loginRequiredMessage.style.display = 'none';
        return;
    }
    
    // Afficher les articles du panier
    cartItems.style.display = 'block';
    cartSummary.style.display = 'block';
    emptyCartMessage.style.display = 'none';
    
    // Vérifier si l'utilisateur est connecté pour la commande
    checkAuthenticationForCheckout();
    
    // Générer le HTML pour chaque article
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.name}</h3>
                <p class="cart-item-price">${item.price.toFixed(2)} €</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                    <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
                </div>
                <button class="cart-item-remove" data-id="${item.id}">Supprimer</button>
            </div>
        </div>
    `).join('');
    
    // Calculer et afficher le total
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    document.getElementById('cart-total-price').textContent = `${totalPrice.toFixed(2)} €`;
    
    // Ajouter les écouteurs d'événements
    addCartEventListeners();
}

// Vérifier l'authentification pour le processus de commande
async function checkAuthenticationForCheckout() {
    const checkoutSection = document.getElementById('checkout-section');
    const loginRequiredMessage = document.getElementById('login-required-message');
    
    const { authenticated, user } = await checkAuthentication();
    currentUser = user;
    
    if (authenticated) {
        checkoutSection.style.display = 'block';
        loginRequiredMessage.style.display = 'none';
        
        // Pré-remplir le formulaire avec les informations de l'utilisateur
        if (user) {
            document.getElementById('name').value = user.name || '';
            document.getElementById('phone').value = user.phone || '';
            
            if (user.address) {
                document.getElementById('street').value = user.address.street || '';
                document.getElementById('city').value = user.address.city || '';
                document.getElementById('postalCode').value = user.address.postalCode || '';
                document.getElementById('country').value = user.address.country || 'France';
            }
        }
    } else {
        checkoutSection.style.display = 'none';
        loginRequiredMessage.style.display = 'block';
    }
}

// Ajouter les écouteurs d'événements pour les boutons du panier
function addCartEventListeners() {
    // Boutons de quantité
    const decreaseButtons = document.querySelectorAll('.decrease-btn');
    const increaseButtons = document.querySelectorAll('.increase-btn');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const removeButtons = document.querySelectorAll('.cart-item-remove');
    
    decreaseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            updateItemQuantity(id, -1);
        });
    });
    
    increaseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            updateItemQuantity(id, 1);
        });
    });
    
    quantityInputs.forEach(input => {
        input.addEventListener('change', () => {
            const id = input.dataset.id;
            const value = parseInt(input.value);
            if (value > 0) {
                setItemQuantity(id, value);
            } else {
                input.value = 1;
                setItemQuantity(id, 1);
            }
        });
    });
    
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            removeFromCart(id);
        });
    });
    
    // Formulaire de commande
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', placeOrder);
    }
}

// Mettre à jour la quantité d'un article
function updateItemQuantity(id, change) {
    const index = cart.findIndex(item => item.id === id);
    if (index !== -1) {
        cart[index].quantity += change;
        
        if (cart[index].quantity < 1) {
            cart[index].quantity = 1;
        }
        
        saveCart();
        updateCartUI();
    }
}

// Définir la quantité d'un article
function setItemQuantity(id, quantity) {
    const index = cart.findIndex(item => item.id === id);
    if (index !== -1) {
        cart[index].quantity = quantity;
        saveCart();
        updateCartUI();
    }
}

// Supprimer un article du panier
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

// Mettre à jour le compteur d'articles dans le panier
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Mettre à jour l'icône du panier si elle existe
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
        
        if (count === 0) {
            cartCountElement.style.display = 'none';
        } else {
            cartCountElement.style.display = 'flex';
        }
    }
}

// Passer commande
async function placeOrder(event) {
    event.preventDefault();
    
    const form = event.target;
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';
    
    // Collecter les informations d'expédition
    const shippingAddress = {
        name: form.name.value,
        street: form.street.value,
        city: form.city.value,
        postalCode: form.postalCode.value,
        country: form.country.value,
        phone: form.phone.value
    };
    
    // Préparer les produits pour la commande
    const products = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
    }));
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                products,
                shippingAddress,
                paymentMethod: form.paymentMethod.value,
                notes: form.notes.value
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            errorMessage.textContent = data.message || 'Erreur lors de la commande';
            return;
        }
        
        // Vider le panier
        cart = [];
        saveCart();
        
        // Rediriger vers la page de confirmation
        window.location.href = `/order-confirmation.html?orderId=${data.order._id}`;
        
    } catch (error) {
        console.error('Erreur:', error);
        errorMessage.textContent = 'Une erreur s\'est produite, veuillez réessayer';
    }
}

// Ajouter un produit au panier depuis la page produits
function addToCart(product) {
    // Vérifier si le produit existe déjà dans le panier
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
        // Augmenter la quantité si le produit existe déjà
        cart[existingItemIndex].quantity += 1;
    } else {
        // Ajouter un nouveau produit
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    
    // Animation ou notification
    alert(`${product.name} ajouté au panier!`);
}

// Initialiser le panier au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});

// Exposer la fonction addToCart globalement pour les autres pages
window.addToCart = addToCart;