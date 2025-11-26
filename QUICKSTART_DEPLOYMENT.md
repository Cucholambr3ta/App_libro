# Recipe Book Ecosystem - Guía Rápida de Deployment

## ✅ Preparación Completada

El código ya está configurado para producción:
- ✅ vercel.json creados (backend y frontend)
- ✅ CORS configurado para producción
- ✅ Variables de entorno preparadas
- ✅ OAuth callbacks actualizados
- ✅ Cambios commiteados y pusheados a GitHub

## 🚀 Próximos Pasos Manuales

### 1. MongoDB Atlas (5 minutos)
1. Ir a https://www.mongodb.com/cloud/atlas/register
2. Crear cuenta gratuita
3. Crear cluster M0 (Free tier)
4. Database Access → Crear usuario
5. Network Access → Permitir 0.0.0.0/0
6. **Copiar connection string**

### 2. Instalar Vercel CLI
```bash
npm install -g vercel
vercel login
```

### 3. Deploy Backend
```bash
cd backend
vercel --prod
```
**Guardar URL**: `https://recipe-book-backend-xxx.vercel.app`

### 4. Configurar Env Vars en Vercel (Backend)
En Vercel Dashboard → Backend Project → Settings → Environment Variables:
```
MONGO_URI=<tu_connection_string_de_atlas>
JWT_SECRET=<genera_un_secret_seguro>
NODE_ENV=production
FRONTEND_URL=<url_del_frontend_despues_de_deploy>
GOOGLE_CLIENT_ID=<opcional_por_ahora>
GOOGLE_CLIENT_SECRET=<opcional_por_ahora>
```

### 5. Deploy Frontend
```bash
cd frontend
vercel --prod
```
**Guardar URL**: `https://recipe-book-frontend-xxx.vercel.app`

### 6. Actualizar Variables Cross-Reference

**Backend** - Agregar en Vercel Dashboard:
```
FRONTEND_URL=https://recipe-book-frontend-xxx.vercel.app
```

**Frontend** - Editar `.env.production` local:
```
VITE_API_URL=https://recipe-book-backend-xxx.vercel.app
```

Luego re-deployar frontend:
```bash
vercel --prod
```

### 7. Actualizar OAuth (Solo si usarás Google/Facebook)
**Google Cloud Console**:
- Authorized redirect URIs: `https://recipe-book-backend-xxx.vercel.app/api/auth/google/callback`

**Facebook Developers**:
- Valid OAuth Redirect URIs: `https://recipe-book-backend-xxx.vercel.app/api/auth/facebook/callback`

## 🧪 Verificación

1. **Backend**: Visitar `https://tu-backend.vercel.app` → debe mostrar JSON de bienvenida
2. **Frontend**: Visitar `https://tu-frontend.vercel.app` → debe cargar login
3. **Registro**: Crear usuario con email/password
4. **MongoDB**: Verificar que usuario aparece en Atlas

## 📚 Documentación Completa

Ver `implementation_plan.md` en artifacts para guía detallada paso a paso con troubleshooting.

## 💡 Consejos

- Usa MongoDB Atlas M0 (gratis) para empezar
- Configura primero sin OAuth, agrégalo después
- Vercel auto-detecta el framework (Vite/Express)
- Los logs se ven con `vercel logs`
