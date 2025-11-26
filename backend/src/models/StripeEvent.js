const mongoose = require('mongoose');

/**
 * Schema para tracking de eventos de Stripe
 * Previene procesamiento duplicado de webhooks
 */
const StripeEventSchema = new mongoose.Schema({
  eventId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  type: String,
  userId: mongoose.Schema.Types.ObjectId,
  email: String,
  sessionId: String,
  processedAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
});

// TTL index: eliminar eventos después de 90 días
StripeEventSchema.index({ processedAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('StripeEvent', StripeEventSchema);
