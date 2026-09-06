import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import http from 'http';

dotenv.config();

const app: Express = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/utech-smart-security';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'API is running', timestamp: new Date() });
});

app.get('/api/v1/devices', (req: Request, res: Response) => {
  res.json({ message: 'Get all devices - Coming soon' });
});

app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  res.json({ message: 'Login endpoint - Coming soon' });
});

app.post('/api/v1/auth/register', (req: Request, res: Response) => {
  res.json({ message: 'Register endpoint - Coming soon' });
});

io.on('connection', (socket) => {
  console.log('🔗 New client connected:', socket.id);
  socket.on('gps-update', (data) => {
    io.emit('gps-update', { socketId: socket.id, ...data });
  });
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket listening on http://localhost:${PORT}`);
});

export { app, io };
