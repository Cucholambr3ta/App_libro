const User = require('../models/Transaction');
const Transaction = require('../models/Transaction');
const StripeEvent = require('../models/StripeEvent');
const mongoose = require('mongoose');
const { verifyReceipt } = require('node-apple-receipt-verify');
const { google } = require('googleapis');

/**
 * Valida un recibo de Apple App Store
 */
async function validateAppleReceipt(receipt) {
  try {
    const config = {
      secret: process.env.APPLE_SHARED_SECRET,
      environment: ['production', 'sandbox'],
      excludeOldTransactions: true,
      extended: true
    };

    const products = await verifyReceipt(receipt, config);

    if (!products || products.length === 0) {
      return { valid: false, error: 'No se encontraron productos válidos' };
    }

    const latestReceipt = products[0];

    if (latestReceipt.productId !== 'premium_subscription_monthly') {
      return { valid: false, error: 'Producto no coincide' };
    }

    if (latestReceipt.cancellationDate) {
      return { valid: false, error: 'Compra cancelada o reembolsada' };
    }

    return {
      valid: true,
      transactionId: latestReceipt.transactionId,
      productId: latestReceipt.productId,
      purchaseDate: new Date(parseInt(latestReceipt.purchaseDateMs)),
      expiresDate: latestReceipt.expiresDateMs 
        ? new Date(parseInt(latestReceipt.expiresDateMs))
        : null
    };
  } catch (error) {
    console.error('❌ Error validando recibo Apple:', error);
    return { valid: false, error: error.message };
  }
}

/**
 * Valida un recibo de Google Play Store
 */
async function validateGoogleReceipt(receipt, productId) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });

    const authClient = await auth.getClient();
    const androidPublisher = google.androidpublisher('v3');

    const receiptData = JSON.parse(receipt);
    
    if (!receiptData.purchaseToken) {
      return { valid: false, error: 'purchaseToken faltante' };
    }

    const response = await androidPublisher.purchases.products.get({
      packageName: process.env.ANDROID_PACKAGE_NAME,
      productId: productId,
      token: receiptData.purchaseToken,
      auth: authClient
    });

    const purchase = response.data;

    if (purchase.purchaseState !== 0) {
      return { valid: false, error: `Estado de compra inválido: ${purchase.purchaseState}` };
    }

    if (purchase.consumptionState === 1) {
      return { valid: false, error: 'Compra ya fue consumida' };
    }

    return {
      valid: true,
      transactionId: receiptData.orderId,
      productId: productId,
      purchaseDate: new Date(parseInt(purchase.purchaseTimeMillis)),
      purchaseToken: receiptData.purchaseToken
    };
  } catch (error) {
    console.error('❌ Error validando recibo Google:', error);
    if (error.code === 404) {
      return { valid: false, error: 'Compra no encontrada en Google Play' };
    }
    return { valid: false, error: error.message };
  }
}

/**
 * @desc    Validar compra In-App (IAP) - PRODUCCIÓN
 * @route   POST /api/payments/validate-iap
 * @access  Private
 */
exports.validateIAP = async (req, res) => {
  try {
    const { receipt, platform, productId, transactionId } = req.body;
    const userId = req.user.id;

    // Validación de entrada
    if (!receipt || !platform || !productId) {
      return res.status(400).json({ 
        message: 'Faltan parámetros requeridos (receipt, platform, productId)' 
      });
    }

    // IDEMPOTENCY CHECK - Evitar doble procesamiento
    const existingTransaction = await Transaction.findOne({ 
      userId, 
      transactionId 
    });

    if (existingTransaction) {
      console.log(`⚠️ Transacción duplicada rechazada: ${transactionId}`);
      return res.status(200).json({ 
        success: true,
        message: 'Transacción ya procesada',
        alreadyProcessed: true
      });
    }

    let validationResult;

    // Validar con Apple/Google
    if (platform === 'ios') {
      validationResult = await validateAppleReceipt(receipt);
    } else if (platform === 'android') {
      validationResult = await validateGoogleReceipt(receipt, productId);
    } else {
      return res.status(400).json({ message: 'Plataforma no soportada' });
    }

    // Verificar resultado de validación
    if (!validationResult.valid) {
      console.error(`❌ Recibo inválido de ${platform}:`, validationResult.error);
      return res.status(400).json({ 
        message: 'Recibo inválido',
        details: process.env.NODE_ENV === 'development' ? validationResult.error : undefined
      });
    }

    // ATOMIC UPDATE - Evitar race conditions
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // Actualizar usuario
      await User.findByIdAndUpdate(
        userId,
        {
          subscriptionStatus: 'premium',
          subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          lastPaymentMethod: platform
        },
        { session }
      );

      // Registrar transacción para idempotency
      await Transaction.create([{
        userId,
        transactionId: validationResult.transactionId,
        platform,
        productId,
        purchaseDate: validationResult.purchaseDate,
        receiptData: receipt,
        status: 'completed'
      }], { session });
    });

    console.log(`✅ Usuario ${userId} actualizado a Premium via ${platform}`);

    res.json({
      success: true,
      message: 'Suscripción activada correctamente',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

  } catch (error) {
    console.error('❌ Error validando IAP:', error);
    res.status(500).json({ message: 'Error al procesar pago' });
  }
};

/**
 * @desc    Webhook de Stripe con verificación de firma
 * @route   POST /api/payments/webhook
 * @access  Public (pero verificado)
 */
exports.handleStripeWebhook = async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // CRÍTICO: Verificar firma con RAW body
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log(`✅ Webhook Stripe verificado: ${event.type}`);

  } catch (err) {
    console.error(`❌ Verificación de firma falló: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // IDEMPOTENCY: Usar event.id de Stripe
  const existingEvent = await StripeEvent.findOne({ eventId: event.id });
  if (existingEvent) {
    console.log(`⚠️ Evento duplicado ignorado: ${event.id}`);
    return res.json({ received: true, processed: false });
  }

  try {
    // Manejar evento
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      const userId = session.client_reference_id;
      const email = session.customer_details?.email;

      if (!userId && !email) {
        throw new Error('No se encontró identificador de usuario');
      }

      // ATOMIC UPDATE con transacción
      const mongoSession = await mongoose.startSession();
      await mongoSession.withTransaction(async () => {
        const query = userId ? { _id: userId } : { email };
        
        await User.findOneAndUpdate(
          query,
          {
            subscriptionStatus: 'premium',
            subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            lastPaymentMethod: 'stripe'
          },
          { session: mongoSession }
        );

        // Registrar evento procesado
        await StripeEvent.create([{
          eventId: event.id,
          type: event.type,
          userId: userId,
          email: email,
          sessionId: session.id,
          processedAt: new Date()
        }], { session: mongoSession });
      });

      console.log(`✅ Usuario ${userId || email} actualizado a Premium via Stripe`);
    }

    res.json({ received: true, processed: true });

  } catch (err) {
    console.error(`❌ Error procesando webhook: ${err.message}`);
    res.json({ received: true, error: err.message });
  }
};
