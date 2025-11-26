const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

let token;
let userId;

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Pruebas de Pagos y Suscripciones', () => {
  
  beforeEach(async () => {
    await User.deleteMany({});
    const user = await User.create({
      email: 'user@example.com',
      password: 'password123',
      role: 'user',
      subscriptionStatus: 'free'
    });
    userId = user._id;
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  it('Debería validar una compra IAP correctamente y actualizar a Premium', async () => {
    const res = await request(app)
      .post('/api/payments/validate-iap')
      .set('Authorization', `Bearer ${token}`)
      .send({
        receipt: 'valid_receipt_mock',
        platform: 'ios'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.subscriptionStatus).toBe('premium');

    const updatedUser = await User.findById(userId);
    expect(updatedUser.subscriptionStatus).toBe('premium');
  });

  it('Debería rechazar un recibo IAP inválido', async () => {
    const res = await request(app)
      .post('/api/payments/validate-iap')
      .set('Authorization', `Bearer ${token}`)
      .send({
        receipt: 'invalid_receipt',
        platform: 'ios'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Recibo inválido');
  });

  it('Debería procesar Webhook de Stripe correctamente', async () => {
    const res = await request(app)
      .post('/api/payments/webhook')
      .send({
        type: 'checkout.session.completed',
        data: {
          object: {
            customer_details: {
              email: 'user@example.com'
            }
          }
        }
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.received).toBe(true);

    const updatedUser = await User.findById(userId);
    expect(updatedUser.subscriptionStatus).toBe('premium');
  });
});
