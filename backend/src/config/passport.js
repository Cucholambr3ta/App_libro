const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

/**
 * Configuración de Passport para autenticación Local y Social.
 */

// Serialización y Deserialización de usuarios
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Estrategia Local
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    // Buscar usuario por email, incluyendo el campo password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return done(null, false, { message: 'Credenciales inválidas' });
    }

    // Verificar si el usuario tiene contraseña (puede ser solo social)
    if (!user.password) {
      return done(null, false, { message: 'Por favor inicie sesión con su red social' });
    }

    // Verificar contraseña
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return done(null, false, { message: 'Credenciales inválidas' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Estrategia Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Lógica de Fusión de Identidad
    let user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      // Si el usuario existe, actualizamos el providerId si no existe
      if (!user.providerId) {
        user.authProvider = 'google';
        user.providerId = profile.id;
        await user.save();
      }
      return done(null, user);
    }

    // Si no existe, crear nuevo usuario
    user = await User.create({
      email: profile.emails[0].value,
      authProvider: 'google',
      providerId: profile.id,
      role: 'user',
      subscriptionStatus: 'free'
    });

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Estrategia Facebook
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/api/auth/facebook/callback",
  profileFields: ['id', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Verificar si Facebook devolvió email
    const email = profile.emails ? profile.emails[0].value : null;
    
    if (!email) {
      return done(new Error('Facebook no proporcionó un email'), null);
    }

    let user = await User.findOne({ email });

    if (user) {
      if (!user.providerId) {
        user.authProvider = 'facebook';
        user.providerId = profile.id;
        await user.save();
      }
      return done(null, user);
    }

    user = await User.create({
      email: email,
      authProvider: 'facebook',
      providerId: profile.id,
      role: 'user',
      subscriptionStatus: 'free'
    });

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

module.exports = passport;
