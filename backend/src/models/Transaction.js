const mongoose = require('mongoose');

/**
 * Schema para tracking de transacciones (IAP + Stripe)
 * Proporciona idempotencia y auditoría de pagos
 */
const TransactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  transactionId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  platform: { 
    type: String, 
    enum: ['ios', 'android', 'stripe'],
    required: true
  },
  productId: String,
  amount: Number,
  currency: String,
  purchaseDate: Date,
  receiptData: String, // Guardar para disputas
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending'
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
});

// Índice compuesto para queries comunes
TransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
