# Recipe Book Ecosystem - Quick Start Guide

## 📦 Project Structure

```
App_libro/
├── backend/          # Node.js + Express + MongoDB
├── frontend/         # React + Vite (Web)
└── mobile/           # React Native + Expo
```

## 🚀 Quick Start

### 1. Backend
```bash
cd backend
npm install
npm run dev    # Starts on http://localhost:5000
```

### 2. Web Frontend
```bash
cd frontend
npm install
npm run dev    # Starts on http://localhost:5173
```

### 3. Mobile App
```bash
cd mobile
npm install
npx expo start  # Scan QR code with Expo Go
```

## 🔑 Key Features

- **Hybrid Auth**: Local + Google + Facebook OAuth
- **RBAC**: User/Admin roles
- **Paywall**: Premium content gating
- **Payments**: Stripe (Web) + IAP (Mobile)
- **Spanish Comments**: All code documented in Spanish ✅

## 📝 Environment Setup

Copy `.env` in backend and configure:
- MongoDB URI
- JWT Secret
- Social Auth credentials (Google, Facebook)
- Stripe keys

## 🎨 Design

- Premium dark mode UI
- Vanilla CSS (no Tailwind)
- Smooth animations
- Mobile-responsive

See [walkthrough.md](file:///C:/Users/place/.gemini/antigravity/brain/29d6b143-51e3-4c06-a8fa-c50c1ecf4140/walkthrough.md) for complete documentation.
