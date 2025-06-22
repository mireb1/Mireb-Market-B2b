// Variables pour les commandes
let userOrders = [];

// Charger les commandes de l'utilisateur
async function loadOrders() {
    const ordersList = document.getElementById('orders-list');
    const noOrdersMessage = document.getElementById('no-orders-message');
    const loginRequiredMessage = document.getElementById('login-required-message');
    
    if (!ordersList) return;
    
    try {
        // Vérifier si l'utilisateur est connecté
        const { authenticated } = await checkAuthentication();
        
        if (!authenticated) {
            ordersList.style.display = 'none';
            noOrdersMessage.style.display = 'none';
            loginRequiredMessage.style.display = 'block';
            return;
        }
        
        // Charger les commandes
        const response = await fetch('/api/orders/my-orders');
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des commandes');
        }
        
        userOrders = await response.json();
        
        // Afficher un message si aucune commande
        if (userOrders.length === 0) {
            ordersList.style.display = 'none';
            noOrdersMessage.style.display = 'block';
            loginRequiredMessage.style.display = 'none';
            return;
        }
        
        // Afficher les commandes
        ordersList.style.display = 'block';
        noOrdersMessage.style.display = 'none';
        loginRequiredMessage.style.display = 'none';
        
        renderOrders(userOrders);
        
    } catch (error) {
        console.error('Erreur:', error);
        ordersList.innerHTML = `<p class="error">Une erreur s'est produite lors du chargement des commandes.</p>`;
    }
}

// Afficher les commandes
function renderOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <span class="order-number">Commande #${order._id.substring(0, 8)}</span>
                    <span class="order-date">${formatDate(order.createdAt)}</span>
                </div>
                <span class="order-status status-${order.status}">${getStatusLabel(order.status)}</span>
            </div>
            <div class="order-content">
                <div class="order-items">
                    ${renderOrderItems(order.products)}
                </div>
                <div class="order-details">
                    <div class="order-shipping">
                        <h4>Adresse de livraison</h4>
                        <p>${order.shippingAddress.name}</p>
                        <p>${order.shippingAddress.street}</p>
                        <p>${order.shippingAddress.postalCode} ${order.shippingAddress.city}</p>
                        <p>${order.shippingAddress.country}</p>
                        <p>Téléphone: ${order.shippingAddress.phone}</p>
                    </div>
                    <div class="order-summary">
                        <h4>Résumé de la commande</h4>
                        <div class="order-payment-method">
                            ${getPaymentMethodLabel(order.paymentMethod)}
                        </div>
                        <div class="order-total">
                            <span>Total</span>
                            <span>${order.totalAmount.toFixed(2)} €</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Afficher les articles d'une commande
function renderOrderItems(products) {
    return products.map(item => `
        <div class="order-item">
            <span class="order-item-quantity">x${item.quantity}</span>
            <span class="order-item-name">${item.product.name}</span>
            <span class="order-item-price">${(item.price * item.quantity).toFixed(2)} €</span>
        </div>
    `).join('');
}

// Formater la date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Obtenir le libellé du statut
function getStatusLabel(status) {
    const statusLabels = {
        'pending': 'En attente',
        'confirmed': 'Confirmée',
        'shipped': 'Expédiée',
        'delivered': 'Livrée',
        'cancelled': 'Annulée'
    };
    
    return statusLabels[status] || status;
}

// Obtenir le libellé du mode de paiement
function getPaymentMethodLabel(method) {
    const methodLabels = {
        'reception': 'Paiement à la réception',
        'card': 'Carte bancaire',
        'paypal': 'PayPal'
    };
    
    return methodLabels[method] || method;
}

// Initialiser la page au chargement
document.addEventListener('DOMContentLoaded', loadOrders);