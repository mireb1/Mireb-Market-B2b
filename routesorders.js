const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// Middleware d'authentification
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_temporaire');
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// Créer une nouvelle commande
router.post('/', authenticate, async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod, notes } = req.body;
    
    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'Panier vide' });
    }
    
    // Vérifier et calculer le montant total
    let totalAmount = 0;
    const orderProducts = [];
    
    for (const item of products) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ message: `Produit ${item.productId} non trouvé` });
      }
      
      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
      
      totalAmount += product.price * item.quantity;
    }
    
    // Créer la commande
    const order = new Order({
      user: req.userId,
      products: orderProducts,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'reception',
      notes
    });
    
    await order.save();
    
    // Populer les détails produits pour la réponse
    const populatedOrder = await Order.findById(order._id)
      .populate('products.product');
    
    res.status(201).json({
      message: 'Commande créée avec succès',
      order: populatedOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtenir toutes les commandes d'un utilisateur
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate('products.product')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtenir les détails d'une commande
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.product')
      .populate('user', 'username name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    
    // Vérifier si l'utilisateur est autorisé à voir cette commande
    if (order.user._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;