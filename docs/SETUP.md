# Setup Guide

## Prerequisites

- **Node.js**: 16.x or higher
- **npm**: 7.x or higher
- **MongoDB**: 4.4 or higher
- **Git**: Latest version
- **Xcode**: Latest (for iOS development)
- **Android Studio**: Latest (for Android development)
- **Git LFS**: For large file handling (optional)

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/owenkunda77-code/utech-smart-security.git
cd utech-smart-security
```

### 2. Switch to App Setup Branch

```bash
git checkout app-setup
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (backend, frontend, mobile)
npm run install-all
```

### 4. Setup Environment Variables

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your settings:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/utech-smart-security
# OR for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/utech-smart-security

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Third-party APIs
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Optional: Twilio for SMS alerts
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### Frontend Environment

```bash
cd ../frontend
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env.local
```

#### Mobile Environment

```bash
cd ../mobile
echo "API_URL=http://localhost:5000/api/v1" > .env
```

### 5. Database Setup

#### Option A: MongoDB Local Setup (macOS)

```bash
# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify connection
mongo mongodb://localhost:27017/utech-smart-security
```

#### Option B: MongoDB Local Setup (Ubuntu/Linux)

```bash
# Add MongoDB repository
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install and start
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Option C: MongoDB Cloud (Atlas)

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `MONGODB_URI` in `backend/.env`

### 6. Initialize Database

```bash
cd backend

# Run database migrations/seeds (when available)
node scripts/seed-db.js
```

## Running the Application

### Option 1: Development Mode (All Services)

```bash
# From project root
npm run dev

# This will start:
# - Backend on http://localhost:5000
# - Frontend on http://localhost:3000
```

### Option 2: Individual Services

#### Backend Only

```bash
cd backend
npm run dev
# Server: http://localhost:5000
# API Health: http://localhost:5000/api/health
```

#### Frontend Only

```bash
cd frontend
npm run dev
# App: http://localhost:3000
```

#### Mobile (Android)

```bash
cd mobile
npm run android
```

#### Mobile (iOS)

```bash
cd mobile
cd ios
pod install
cd ..
npm run ios
```

## Verification

### 1. Backend Health Check

```bash
curl http://localhost:5000/api/health

# Expected response:
# {"status":"API is running","timestamp":"2023-04-15T10:30:00.000Z"}
```

### 2. Frontend Access

Open browser and navigate to: `http://localhost:3000`

You should see the login page.

### 3. Database Connection

```bash
# Test connection from backend logs
cd backend
npm run dev

# Look for: ✅ MongoDB connected
```

## Development Workflow

### Creating a Feature

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes in the appropriate directory:
   ```
   backend/   - API changes
   frontend/  - UI changes
   mobile/    - Mobile app changes
   docs/      - Documentation changes
   ```

3. Test your changes locally

4. Commit with descriptive message:
   ```bash
   git commit -m "feat: add device tracking feature"
   ```

5. Push to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request

## Troubleshooting

### MongoDB Connection Error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
```bash
# Check if MongoDB is running
brew services list

# Start MongoDB
brew services start mongodb-community

# Or manually:
mongod --config /usr/local/etc/mongod.conf
```

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### CORS Error in Frontend

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Check `CORS_ORIGIN` in `backend/.env`:
   ```bash
   CORS_ORIGIN=http://localhost:3000
   ```
2. Restart backend after changes
3. Clear browser cache and cookies

### Module Not Found

**Error:** `Cannot find module '@module/name'`

**Solution:**
```bash
# Reinstall dependencies
cd backend  # or frontend or mobile
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

**Error:** `Type 'X' is not assignable to type 'Y'`

**Solution:**
```bash
# Clear build cache and rebuild
cd backend
rm -rf dist
npm run build
```

## Production Deployment

### Build for Production

```bash
# Build all services
npm run build

# Or individual services
cd backend && npm run build
cd ../frontend && npm run build
```

### Backend Deployment

**Heroku:**
```bash
heroku create your-app-name
heroku buildpacks:add heroku/nodejs
heroku config:set MONGODB_URI=<your_mongodb_uri>
heroku config:set JWT_SECRET=<secure_random_string>
git push heroku main
```

**DigitalOcean / AWS / Railway:**
- Set environment variables in dashboard
- Connect GitHub repo
- Enable auto-deploy

### Frontend Deployment

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir dist
```

**GitHub Pages:**
```bash
npm run build
# Deploy dist/ folder
```

## Performance Optimization

### Backend
- Enable gzip compression
- Implement caching (Redis)
- Optimize database queries
- Use connection pooling

### Frontend
- Enable code splitting
- Lazy load components
- Optimize images
- Use CDN for static assets

### Mobile
- Enable code minification
- Optimize bundle size
- Implement offline caching
