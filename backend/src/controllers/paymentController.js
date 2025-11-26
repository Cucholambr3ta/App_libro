const User = require('../models/User');

/**
 * @desc    Validar compra In-App (IAP) - Mock para MVP
 * @route   POST /api/payments/validate-iap
 * @access  Private
 */
exports.validateIAP = async (req, res) => {
  try {
    const { receipt, platform } = req.body;
    const userId = req.user.id;

    // En un entorno real, aquí se validaría el 'receipt' con Apple (App Store) o Google (Play Store)
    // usando librerías como 'iap' o llamadas directas a sus APIs.
    
    // MOCK: Simulamos validación exitosa si el recibo contiene "valid_receipt"
    if (!receipt || !receipt.includes('valid_receipt')) {
      return res.status(400).json({ message: 'Recibo inválido' });
    }

    // Actualizar usuario a Premium
    const user = await User.findByIdAndUpdate(userId, {
      subscriptionStatus: 'premium',
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días de ejemplo
    }, { new: true });

    res.json({
      success: true,
      message: 'Suscripción validada correctamente',
      subscriptionStatus: user.subscriptionStatus
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al validar pago' });
  }
};

/**
 * @desc    Webhook de Stripe
 * @route   POST /api/payments/webhook
 * @access  Public
 */
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // En producción:
    // event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    // MOCK para MVP: Asumimos que el body ya es el evento verificado (en test se enviará así)
    event = req.body;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Buscar usuario por email (Stripe suele enviar el email del cliente)
      // O usar client_reference_id si se pasó al crear la sesión
      const email = session.customer_details.email;
      
      if (email) {
        await User.findOneAndUpdate({ email }, {
          subscriptionStatus: 'premium',
          subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        console.log(`Usuario ${email} actualizado a Premium via Stripe`);
      }
    }

    res.json({ received: true });

  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
