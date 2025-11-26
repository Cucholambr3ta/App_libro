# Deployment Guide

Este proyecto está configurado para deployment en Vercel y MongoDB Atlas.

## Variables de Entorno Requeridas

### Backend (Vercel)
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.vercel.app
```

## Pasos de Deployment

1. **MongoDB Atlas**: Crear cluster y obtener connection string
2. **Backend**: `cd backend && vercel --prod`
3. **Frontend**: `cd frontend && vercel --prod`
4. **Configurar OAuth redirects** con las URLs de producción
5. **Actualizar variables de entorno** en Vercel Dashboard

Ver `implementation_plan.md` en artifacts para guía completa paso a paso.
