// Ajoutez cette fonction à votre fichier products.js existant
// Remplacer la fonction qui gère les boutons "Ajouter au panier"

// Afficher les produits dans le conteneur
function renderProducts() {
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = `<p>Aucun produit ne correspond à votre recherche.</p>`;
        return;
    }
    
    productsContainer.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product._id}">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <p class="price">${product.price.toFixed(2)} €</p>
            <button class="btn-primary add-to-cart-btn" 
                data-id="${product._id}" 
                data-name="${product.name}" 
                data-price="${product.price}" 
                data-image="${product.image}">
                Ajouter au panier
            </button>
        </div>
    `).join('');
    
    // Ajouter les écouteurs d'événements pour les boutons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = {
                id: this.dataset.id,
                name: this.dataset.name,
                price: parseFloat(this.dataset.price),
                image: this.dataset.image
            };
            
            // Utiliser la fonction addToCart de cart.js
            if (typeof window.addToCart === 'function') {
                window.addToCart(product);
            } else {
                alert(`${product.name} ajouté au panier!`);
                console.warn('La fonction addToCart n\'est pas disponible');
            }
        });
    });
}