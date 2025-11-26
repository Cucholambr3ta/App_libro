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
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return done(null, false, { message: 'Credenciales inválidas' });
    }

    if (!user.password) {
      return done(null, false, { message: 'Por favor inicie sesión con su red social' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return done(null, false, { message: 'Credenciales inválidas' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Estrategia Google - CON MERGE SEGURO
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const googleId = profile.id;

    // 1. Buscar primero por providerId específico de Google
    let user = await User.findOne({ 
      authProvider: 'google', 
      providerId: googleId 
    });

    if (user) {
      // Usuario Google ya existe
      return done(null, user);
    }

    // 2. Buscar por email (posible merge)
    user = await User.findOne({ email });

    if (user) {
      // MERGE SEGURO: Solo si es cuenta local pura
      if (user.authProvider === 'local' && !user.providerId) {
        console.log(`🔗 Merging Google account with local user: ${email}`);
        
        user.providerId = googleId;
        await user.save();
        
        return done(null, user);
      } else {
        // Cuenta ya tiene otro proveedor social - RECHAZAR
        return done(new Error(
          `Esta cuenta ya está vinculada con ${user.authProvider}. ` +
          `Use ${user.authProvider} para iniciar sesión.`
        ), null);
      }
    }

    // 3. Crear nuevo usuario Google
    user = await User.create({
      email,
      authProvider: 'google',
      providerId: googleId,
      role: 'user',
      subscriptionStatus: 'free'
    });

    console.log(`✅ Nuevo usuario Google creado: ${email}`);
    return done(null, user);
  } catch (err) {
    console.error('❌ Error en Google Strategy:', err);
    return done(err, null);
  }
}));

// Estrategia Facebook - CON MERGE SEGURO
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/api/auth/facebook/callback",
  profileFields: ['id', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails ? profile.emails[0].value : null;
    
    if (!email) {
      return done(new Error('Facebook no proporcionó un email'), null);
    }

    const facebookId = profile.id;

    // 1. Buscar primero por providerId específico
    let user = await User.findOne({ 
      authProvider: 'facebook', 
      providerId: facebookId 
    });

    if (user) {
      return done(null, user);
    }

    // 2. Buscar por email (posible merge)
    user = await User.findOne({ email });

    if (user) {
      // MERGE SEGURO: Solo si es cuenta local pura
      if (user.authProvider === 'local' && !user.providerId) {
        console.log(`🔗 Merging Facebook account with local user: ${email}`);
        
        user.providerId = facebookId;
        await user.save();
        
        return done(null, user);
      } else {
        // Rechazar merge con otra red social
        return done(new Error(
          `Cuenta ya vinculada con ${user.authProvider}`
        ), null);
      }
    }

    // 3. Crear nuevo usuario Facebook
    user = await User.create({
      email: email,
      authProvider: 'facebook',
      providerId: facebookId,
      role: 'user',
      subscriptionStatus: 'free'
    });

    console.log(`✅ Nuevo usuario Facebook creado: ${email}`);
    return done(null, user);
  } catch (err) {
    console.error('❌ Error en Facebook Strategy:', err);
    return done(err, null);
  }
}));

module.exports = passport;
