const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint untuk Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server berjalan dengan baik' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Battle Proximity Server API', 
    version: '1.0.0',
    status: 'running'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User terhubung:', socket.id);

  // Handle proximity detection events
  socket.on('proximity_detected', (data) => {
    console.log('Proximity terdeteksi:', data);
    // Broadcast ke semua client kecuali sender
    socket.broadcast.emit('battle_triggered', {
      playerId: socket.id,
      proximityData: data,
      timestamp: new Date().toISOString()
    });
  });

  // Handle battle events
  socket.on('battle_start', (data) => {
    console.log('Battle dimulai:', data);
    io.emit('battle_status', {
      status: 'started',
      players: [socket.id],
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User terputus:', socket.id);
  });
});

// Get port from environment variable atau default 3000
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
  console.log(`📡 Socket.IO server siap menerima koneksi`);
  console.log(`🏥 Health check tersedia di: http://localhost:${PORT}/health`);
}); 