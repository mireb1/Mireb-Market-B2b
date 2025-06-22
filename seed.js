require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion MongoDB:', err));

// Produits de test
const seedProducts = [
  {
    name: 'Smartphone XYZ',
    price: 499.99,
    description: 'Un smartphone puissant avec appareil photo haute résolution et batterie longue durée',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop',
    category: 'Électronique',
    inStock: true
  },
  {
    name: 'Ordinateur portable Pro',
    price: 1299.99,
    description: 'Ordinateur portable professionnel idéal pour le travail et les jeux',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop',
    category: 'Électronique',
    inStock: true
  },
  {
    name: 'Casque audio sans fil',
    price: 149.99,
    description: 'Profitez d\'un son exceptionnel sans vous encombrer de câbles',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop',
    category: 'Électronique',
    inStock: true
  },
  {
    name: 'T-shirt Premium',
    price: 29.99,
    description: 'T-shirt confortable en coton bio, idéal pour toutes les saisons',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop',
    category: 'Vêtements',
    inStock: true
  },
  {
    name: 'Chaise de bureau ergonomique',
    price: 199.99,
    description: 'Chaise de bureau confortable avec support lombaire pour une bonne posture',
    image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=500&auto=format&fit=crop',
    category: 'Maison',
    inStock: true
  },
  {
    name: 'Lampe de bureau LED',
    price: 49.99,
    description: 'Lampe moderne et économique avec plusieurs niveaux d\'éclairage',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop',
    category: 'Maison',
    inStock: true
  },
];

// Supprimer tous les produits existants puis ajouter les nouveaux
async function seedDatabase() {
  try {
    await Product.deleteMany({});
    console.log('Produits existants supprimés');

    await Product.insertMany(seedProducts);
    console.log('Nouveaux produits ajoutés avec succès!');

    mongoose.connection.close();
  } catch (error) {
    console.error('Erreur lors du seeding:', error);
  }
}

seedDatabase();