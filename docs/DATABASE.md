# Database Schema

## Collections

### Users

```javascript
{
  _id: ObjectId,
  email: String,              // Unique, required
  password: String,           // Hashed, required
  name: String,               // required
  role: String,               // admin, user (default: user)
  phone: String,              // optional
  avatar: String,             // URL to avatar image
  isActive: Boolean,          // default: true
  lastLogin: Date,            // optional
  createdAt: Date,            // auto-set
  updatedAt: Date             // auto-set
}
```

**Indexes:**
```
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ createdAt: -1 })
db.users.createIndex({ role: 1 })
```

### Devices

```javascript
{
  _id: ObjectId,
  name: String,               // required
  type: String,               // gps, beacon, rfid, etc.
  deviceId: String,           // Unique hardware ID
  userId: ObjectId,           // Reference to Users
  status: String,             // active, inactive, lost (default: active)
  model: String,              // Device model
  manufacturer: String,       // Device manufacturer
  imei: String,               // International Mobile Equipment Identity
  lastLocation: {
    latitude: Number,         // -90 to 90
    longitude: Number,        // -180 to 180
    accuracy: Number,         // Accuracy in meters
    timestamp: Date
  },
  battery: Number,            // 0-100 percentage
  signalStrength: Number,     // RSSI in dBm
  metadata: Map,              // Custom metadata
  createdAt: Date,
  updatedAt: Date,
  lastActiveAt: Date
}
```

**Indexes:**
```
db.devices.createIndex({ userId: 1 })
db.devices.createIndex({ deviceId: 1 }, { unique: true })
db.devices.createIndex({ status: 1 })
db.devices.createIndex({ 'lastLocation.timestamp': -1 })
db.devices.createIndex({ 'lastLocation': '2dsphere' })
```

### GPS Tracking Data

```javascript
{
  _id: ObjectId,
  deviceId: ObjectId,         // Reference to Devices
  latitude: Number,           // required
  longitude: Number,          // required
  accuracy: Number,           // GPS accuracy in meters
  speed: Number,              // Speed in km/h
  heading: Number,            // Direction 0-360 degrees
  altitude: Number,           // Altitude in meters
  provider: String,           // GPS, NETWORK, FUSED, etc.
  timestamp: Date,            // GPS timestamp
  createdAt: Date             // Server timestamp
}
```

**Indexes:**
```
db.gps_tracking.createIndex({ deviceId: 1, timestamp: -1 })
db.gps_tracking.createIndex({ timestamp: -1 })
db.gps_tracking.createIndex({ 'coordinates': '2dsphere' })
db.gps_tracking.createIndex({ createdAt: -1 }, { expireAfterSeconds: 7776000 })
```

### Alerts

```javascript
{
  _id: ObjectId,
  deviceId: ObjectId,         // Reference to Devices
  userId: ObjectId,           // Reference to Users
  type: String,               // geofence_exit, low_battery, theft, offline, etc.
  title: String,              // Alert title
  message: String,            // Alert message
  severity: String,           // critical, warning, info (default: warning)
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  isResolved: Boolean,        // default: false
  resolvedAt: Date,           // optional
  resolvedBy: ObjectId,       // Reference to Users
  metadata: Map,              // Additional context
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```
db.alerts.createIndex({ deviceId: 1, createdAt: -1 })
db.alerts.createIndex({ userId: 1, createdAt: -1 })
db.alerts.createIndex({ isResolved: 1 })
db.alerts.createIndex({ severity: 1 })
db.alerts.createIndex({ type: 1 })
```

### Geofences

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to Users
  name: String,               // required
  description: String,        // optional
  type: String,               // circle, polygon, etc.
  coordinates: {
    center: {
      latitude: Number,
      longitude: Number
    },
    radius: Number            // In meters (for circle)
  },
  polygon: [
    { latitude: Number, longitude: Number },
    // ... multiple points for polygon
  ],
  deviceIds: [ObjectId],      // References to Devices
  alertOnExit: Boolean,       // default: true
  alertOnEntry: Boolean,      // default: false
  color: String,              // Hex color for UI
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```
db.geofences.createIndex({ userId: 1 })
db.geofences.createIndex({ deviceIds: 1 })
db.geofences.createIndex({ 'coordinates': '2dsphere' })
```

## Data Relationships

```
Users (1) ─── (N) Devices
  │                │
  │                └─── (N) GPS_Tracking
  │                └─── (N) Alerts
  │                └─── (N) Geofences
  │
  └─── (N) Alerts
  └─── (N) Geofences
```

## Capacity Planning

### Storage Estimation

- **Users Collection**: ~1KB per user
- **Devices Collection**: ~5KB per device
- **GPS Tracking**: ~300 bytes per record
  - Average device update frequency: 1/min = ~432K records/device/year
  - For 1000 devices: ~432GB/year with daily updates

### TTL (Time To Live) Indexes

GPS tracking data older than 90 days is automatically deleted:

```javascript
db.gps_tracking.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 7776000 }  // 90 days
)
```

## Backup Strategy

- **Frequency**: Daily automated backups
- **Retention**: 30 days of backups
- **Method**: MongoDB Atlas automated backups or manual dumps
- **Recovery**: Point-in-time restore capability

## Performance Optimization

### Query Optimization

```javascript
// Get recent positions for a device
db.gps_tracking
  .find({ deviceId: ObjectId(...), createdAt: { $gte: ISODate(...) } })
  .sort({ createdAt: -1 })
  .limit(100)
  .hint({ deviceId: 1, timestamp: -1 })
```

### Geospatial Queries

```javascript
// Find devices near a location
db.devices.find({
  'lastLocation': {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [-74.0060, 40.7128]
      },
      $maxDistance: 5000  // 5km
    }
  }
})
```
