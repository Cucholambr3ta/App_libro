const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const passport = require('./config/passport');

// Conectar a la base de datos
connectDB();

const app = express();

// Configuración de CORS para desarrollo y producción
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL // Se configurará en Vercel
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

// Middleware de seguridad y utilidades
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Inicializar Passport
app.use(passport.initialize());

// Ruta base para verificar estado
app.get('/', (req, res) => {
  res.json({ message: 'API Recipe Book Ecosystem funcionando correctamente' });
});

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

module.exports = app;
