# API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <token>
```

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2023-04-15T10:30:00Z"
}
```

## Endpoints

### Authentication

#### Login

```
POST /auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  },
  "message": "Login successful"
}
```

#### Register

```
POST /auth/register
```

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "email": "newuser@example.com",
    "name": "Jane Doe"
  },
  "message": "User registered successfully"
}
```

### Devices

#### Get All Devices

```
GET /devices
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Car GPS Tracker",
      "type": "gps",
      "status": "active",
      "lastLocation": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "accuracy": 10
      },
      "battery": 85,
      "lastUpdate": "2023-04-15T10:30:00Z"
    }
  ]
}
```

#### Get Device by ID

```
GET /devices/:id
```

#### Create Device

```
POST /devices
```

**Request:**
```json
{
  "name": "New Tracker",
  "type": "gps",
  "deviceId": "device-001"
}
```

#### Update Device

```
PUT /devices/:id
```

**Request:**
```json
{
  "name": "Updated Name",
  "status": "inactive"
}
```

#### Delete Device

```
DELETE /devices/:id
```

### GPS Tracking

#### Submit GPS Update

```
POST /gps/update
```

**Request:**
```json
{
  "deviceId": "device-001",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10,
  "speed": 0,
  "heading": 0,
  "altitude": 10
}
```

#### Get Device Tracking History

```
GET /gps/history/:deviceId?startDate=2023-04-15&endDate=2023-04-16&limit=100
```

### Alerts

#### Get Active Alerts

```
GET /alerts?status=active
```

#### Create Alert

```
POST /alerts
```

**Request:**
```json
{
  "deviceId": "device-001",
  "type": "geofence_exit",
  "message": "Device left designated area",
  "severity": "warning"
}
```

#### Resolve Alert

```
PUT /alerts/:id/resolve
```

## WebSocket Events

### Connection

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: '<jwt-token>'
  }
});
```

### Real-time GPS Updates

**Event Name:** `gps-update`

**Server Emits:**
```json
{
  "deviceId": "device-001",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10,
  "timestamp": "2023-04-15T10:30:00Z"
}
```

**Client Listens:**
```javascript
socket.on('gps-update', (data) => {
  console.log('New GPS update:', data);
  updateMapMarker(data);
});
```

### Device Status Change

**Event Name:** `device-status`

**Payload:**
```json
{
  "deviceId": "device-001",
  "status": "active",
  "battery": 85,
  "timestamp": "2023-04-15T10:30:00Z"
}
```

### Alert Notification

**Event Name:** `alert`

**Payload:**
```json
{
  "alertId": "alert-001",
  "deviceId": "device-001",
  "type": "geofence_exit",
  "message": "Device left designated area",
  "severity": "warning",
  "timestamp": "2023-04-15T10:30:00Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request parameters",
  "details": ["email is required"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication failed",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

The API implements rate limiting:
- **General endpoints**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- **GPS updates**: 1000 requests per 15 minutes

**Headers in Response:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1681556400
```
