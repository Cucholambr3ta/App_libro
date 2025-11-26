const mongoose = require('mongoose');

// Variable global para cachear conexión entre invocaciones Lambda
let cachedConnection = null;

/**
 * Conecta a MongoDB con patrón de caché para Vercel Serverless.
 * Reutiliza conexiones existentes para evitar agotamiento del pool.
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  // Si ya existe una conexión activa, reutilizarla
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Reutilizando conexión MongoDB existente');
    return cachedConnection;
  }

  try {
    // Configuración optimizada para Vercel serverless
    const opts = {
      serverSelectionTimeoutMS: 5000, // Timeout más corto
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Limitar pool para MongoDB Atlas M0
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, opts);
    
    cachedConnection = conn;
    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
    
    return conn;
  } catch (error) {
    console.error(`❌ Error MongoDB: ${error.message}`);
    
    // NO usar process.exit() en serverless - Lambda manejará el error
    throw new Error(`Fallo de conexión a MongoDB: ${error.message}`);
  }
};

module.exports = connectDB;
