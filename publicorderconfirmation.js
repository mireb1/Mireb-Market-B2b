// Charger les détails de la commande
async function loadOrderDetails() {
    const orderDetailsElement = document.getElementById('order-details');
    
    // Récupérer l'ID de la commande depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (!orderId) {
        orderDetailsElement.innerHTML = `<p class="error">Aucun identifiant de commande trouvé.</p>`;
        return;
    }
    
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des détails de la commande');
        }
        
        const order = await response.json();
        renderOrderDetails(order);
        
    } catch (error) {
        console.error('Erreur:', error);
        orderDetailsElement.innerHTML = `<p class="error">Une erreur s'est produite lors du chargement des détails de la commande.</p>`;
    }
}

// Afficher les détails de la commande
function renderOrderDetails(order) {
    const orderDetailsElement = document.getElementById('order-details');
    
    orderDetailsElement.innerHTML = `
        <div class="order-header">
            <div>
                <h3>Commande #${order._id.substring(0, 8)}</h3>
                <p class="order-date">Passée le ${formatDate(order.createdAt)}</p>
            </div>
            <span class="order-status status-${order.status}">${getStatusLabel(order.status)}</span>
        </div>
        
        <div class="order-content">
            <h4>Articles commandés</h4>
            <div class="order-items">
                ${renderOrderItems(order.products)}
            </div>
            
            <div class="order-info-row">
                <div class="order-shipping">
                    <h4>Adresse de livraison</h4>
                    <p>${order.shippingAddress.name}</p>
                    <p>${order.shippingAddress.street}</p>
                    <p>${order.shippingAddress.postalCode} ${order.shippingAddress.city}</p>
                    <p>${order.shippingAddress.country}</p>
                    <p>Téléphone: ${order.shippingAddress.phone}