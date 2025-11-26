const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const passport = require('./config/passport');

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware de seguridad y utilidades
app.use(helmet());
app.use(cors());
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
