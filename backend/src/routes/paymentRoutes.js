const express = require('express');
const router = express.Router();
const { validateIAP, handleStripeWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Validar compra In-App (IAP)
router.post('/validate-iap', protect, validateIAP);

// Webhook de Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
