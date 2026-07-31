# 🚀 Mresh Salon - Deployment Guide

This guide explains how to deploy the **Backend on Render** and the **Frontend on Netlify** with full cross-origin CORS support and real-time WebSockets.

---

## 1. Deploying the Backend on Render (using Docker)

1. **Connect Repository to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/) and click **New > Blueprint**.
   - Connect your GitHub repository.
   - Render will automatically detect `render.yaml` and set up the service using the `Dockerfile`.

2. **Manual Web Service Configuration (Alternative)**:
   - **Environment**: **Docker**
   - **Dockerfile Path**: `./Dockerfile`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `JWT_SECRET`: `your_secure_secret_key`
     - `GEMINI_API_KEY`: Your Google Gemini API Key
     - `PORT`: `10000` (Render sets this automatically)

3. **Copy your Render Web Service URL**:
   - Once deployed, Render will provide a live backend URL (e.g., `https://mresh-salon-backend.onrender.com`).

---

## 2. Deploying the Frontend on Netlify

1. **Import Repository to Netlify**:
   - Go to [Netlify Dashboard](https://app.netlify.com/) and click **Add new site > Import an existing project**.
   - Select your GitHub repository.

2. **Build Settings** (Netlify auto-detects `netlify.toml`):
   - **Build command**: `npm run build:client` (or `npm run build`)
   - **Publish directory**: `dist`

3. **Configure Environment Variable on Netlify**:
   - In Netlify Site Settings > **Environment variables**, add:
     - `VITE_API_URL`: `https://mresh-salon-backend.onrender.com` (replace with your actual Render URL).

4. **Deploy Site**:
   - Click **Deploy Site**. Netlify will build the Vite SPA, apply SPA routing rules, and point all REST and WebSocket connections to your Render backend.

---

## 3. Verify Live Setup

- Open your Netlify site URL (e.g. `https://mresh-salon.netlify.app`).
- Try logging in, booking an appointment, or using the Live Client Chat.
- The frontend will automatically route API requests to your Render server and establish WebSocket connections over `wss://`.
