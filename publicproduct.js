// Éléments DOM
const productsContainer = document.getElementById('products-container');
const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('category-filter');
const productForm = document.getElementById('product-form');
const addProductModal = document.getElementById('add-product-form');

// Variables globales
let allProducts = [];
let filteredProducts = [];

// Charger tous les produits depuis l'API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        renderProducts();
        
        // Ajouter le bouton d'ajout après chargement (pour les démos/admins)
        addFloatingButton();
    } catch (error) {
        console.error('Erreur de chargement:', error);
        productsContainer.innerHTML = `<p class="error">Erreur de chargement des produits. Veuillez réessayer.</p>`;
    }
}

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
            <button class="btn-primary">Ajouter au panier</button>
        </div>
    `).join('');
    
    // Ajouter les écouteurs d'événements pour les boutons
    const addToCartButtons = document.querySelectorAll('.product-card button');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.parentElement.querySelector('h3').textContent;
            alert(`${productName} ajouté au panier!`);
        });
    });
}

// Filtrer les produits selon la recherche et la catégorie
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                             product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    renderProducts();
}

// Ajouter un nouveau produit
async function addProduct(event) {
    event.preventDefault();
    
    const formData = new FormData(productForm);
    const productData = {};
    
    formData.forEach((value, key) => {
        if (key === 'price') {
            productData[key] = parseFloat(value);
        } else {
            productData[key] = value;
        }
    });
    
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de l\'ajout du produit');
        }
        
        // Ajouter le nouveau produit à la liste et réinitialiser le formulaire
        const newProduct = await response.json();
        allProducts.push(newProduct);
        filteredProducts.push(newProduct);
        productForm.reset();
        closeAddProductForm();
        renderProducts();
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'ajout du produit');
    }
}

// Ajouter le bouton flottant pour ajouter un produit
function addFloatingButton() {
    const button = document.createElement('div');
    button.className = 'add-product-btn';
    button.innerHTML = '+';
    button.addEventListener('click', openAddProductForm);
    document.body.appendChild(button);
}

// Ouvrir le formulaire d'ajout de produit
function openAddProductForm() {
    addProductModal.style.display = 'block';
}

// Fermer le formulaire d'ajout de produit
function closeAddProductForm() {
    addProductModal.style.display = 'none';
}

// Écouteurs d'événements
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    
    // Filtrer les produits lorsque l'utilisateur tape dans la recherche
    searchInput.addEventListener('input', filterProducts);
    
    // Filtrer les produits lorsque l'utilisateur change la catégorie
    categoryFilter.addEventListener('change', filterProducts);
    
    // Soumettre le formulaire d'ajout de produit
    productForm.addEventListener('submit', addProduct);
    
    // Fermer le modal si on clique à l'extérieur
    window.addEventListener('click', function(event) {
        if (event.target === addProductModal) {
            closeAddProductForm();
        }
    });
});

// Exposer la fonction closeAddProductForm pour le HTML
window.closeAddProductForm = closeAddProductForm;