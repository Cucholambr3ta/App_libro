const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, googleCallback, facebookCallback, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Rutas de Autenticación Local
router.post('/register', register);
router.post('/login', login);

// Rutas de Autenticación Social (Google)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);

// Rutas de Autenticación Social (Facebook)
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), facebookCallback);

// Ruta de Usuario Actual
router.get('/me', protect, getMe);

module.exports = router;
