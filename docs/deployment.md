# AgriOptima AI — Deployment Guide

## Production Deployment

### Prerequisites
- Node.js >= 20.x
- Python 3.10+ (for model re-training scripts)
- Port 3000

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
PORT=3000
JWT_SECRET=your_secure_production_secret
NODE_ENV=production
```

### Build & Run
```bash
# Install dependencies
npm install

# Build static assets
npm run build

# Start production server
npm run start
```

### Docker Deployment
```bash
docker-compose up --build -d
```
The application will be live at `http://localhost:3000`.
