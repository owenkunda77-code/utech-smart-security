# System Architecture

## Overview

UTECH Smart Security uses a modern three-tier architecture with real-time capabilities:

```
┌──────────────────────┐
│   Web Frontend       │
│   (React + Vite)     │
└──────────┬───────────┘
           │ HTTP/WebSocket
           ↓
┌──────────────────────┐
│   API Server         │
│ (Express.js + Node)  │
│  with Socket.IO      │
└──────────┬───────────┘
           │ MongoDB Driver
           ↓
┌──────────────────────┐
│   Database           │
│   (MongoDB)          │
└──────────────────────┘

┌──────────────────────┐
│   Mobile App         │
│  (React Native)      │
└──────────┬───────────┘
           │ HTTP/WebSocket
           ↓ (Same API Server)
```

## Components

### Frontend (React + Vite)
- **Purpose**: User-facing dashboard and interface
- **Technologies**: React 18, TypeScript, Tailwind CSS, Leaflet, Vite
- **Port**: 3000
- **Features**: 
  - Real-time device tracking
  - User dashboard
  - Admin panel
  - Map visualization
  - Responsive design

### Backend (Express.js + Socket.IO)
- **Purpose**: RESTful API and WebSocket server
- **Technologies**: Node.js, Express, Socket.IO, MongoDB Driver, JWT
- **Port**: 5000
- **Features**: 
  - User authentication & authorization
  - Device management (CRUD operations)
  - GPS data collection and storage
  - Real-time GPS updates via WebSocket
  - Alert generation and management
  - Rate limiting for API protection

### Mobile (React Native)
- **Purpose**: Cross-platform mobile application
- **Technologies**: React Native, TypeScript, React Navigation
- **Platforms**: iOS & Android
- **Features**: 
  - GPS tracking
  - Push notifications
  - Offline support
  - Tab-based navigation
  - User authentication

### Database (MongoDB)
- **Purpose**: Data persistence
- **Collections**: 
  - Users
  - Devices
  - GPS Tracking Data
  - Alerts
  - Geofences

## Data Flow

### 1. User Authentication
```
User → Login Form → Express API → MongoDB → JWT Token → Client
```

### 2. Device Registration
```
Admin → Web Form → Express API → MongoDB → Device Created
```

### 3. Real-time GPS Updates
```
Mobile App → GPS Location → Socket.IO → Express Server → MongoDB
                                      ↓
                    Broadcast to Connected Clients
                                      ↓
                        Web Dashboard & Other Mobiles
```

### 4. Device Tracking
```
Web Dashboard → WebSocket Connection → Real-time Updates → Map Display
```

## Security Architecture

### Authentication
- JWT tokens with expiration (7 days configurable)
- Secure password hashing with bcryptjs
- Token refresh mechanism

### API Security
- CORS protection (configurable origins)
- Rate limiting on sensitive endpoints
- Input validation using Joi
- Request sanitization

### Data Security
- HTTPS/TLS for transport security
- Encrypted environment variables
- Secure database access controls
- MongoDB authentication

### Frontend Security
- Secure token storage
- XSS protection
- CSRF token validation
- Content Security Policy headers

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers can be scaled horizontally
- Load balancing with nginx or similar
- Session management via JWT (no server-side sessions)

### Database Scaling
- MongoDB replica sets for high availability
- Sharding for large datasets
- Index optimization for GPS queries
- Geospatial indexes for location-based searches

### Real-time Performance
- Socket.IO adapter for multi-server deployments
- Message queuing (Redis) for event distribution
- Database connection pooling

## Deployment Architecture

```
CDN (Static Assets)
     ↓
Load Balancer
     ↓
┌─────────────────────────────┐
│  Application Servers (×N)   │
│  - Express.js API           │
│  - Socket.IO Gateway        │
└─────────────────────────────┘
     ↓
┌─────────────────────────────┐
│  Redis Cache                │
│  (Session & Message Queue)  │
└─────────────────────────────┘
     ↓
┌─────────────────────────────┐
│  MongoDB Replica Set        │
│  (Primary + Secondaries)    │
└─────────────────────────────┘
```
