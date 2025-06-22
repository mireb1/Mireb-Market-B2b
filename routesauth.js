const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, phone } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet utilisateur ou email existe déjà' });
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer un nouvel utilisateur
    const user = new User({
      username,
      password: hashedPassword,
      name,
      email,
      phone
    });
    
    await user.save();
    
    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Trouver l'utilisateur
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }
    
    // Créer un token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'secret_temporaire',
      { expiresIn: '24h' }
    );
    
    // Envoyer le token dans un cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    });
    
    res.json({
      message: 'Connexion réussie',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route de déconnexion
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Déconnexion réussie' });
});

// Route pour vérifier l'authentification
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ authenticated: false });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_temporaire');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ authenticated: false });
    }
    
    res.json({ 
      authenticated: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(401).json({ authenticated: false });
  }
});

module.exports = router;