require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}

// Para Vercel (serverless)
module.exports = app;
