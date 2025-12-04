import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for the shared code
let sharedCode = '';

// REST endpoint to get current code
app.get('/api/code', (req, res) => {
  res.json({ code: sharedCode });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send current code to the newly connected client
  socket.emit('code-update', sharedCode);

  // Listen for code updates from clients
  socket.on('code-change', (newCode) => {
    sharedCode = newCode;
    console.log(`Code updated by ${socket.id}`);
    
    // Broadcast the updated code to all connected clients
    io.emit('code-update', sharedCode);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Start the server
const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`PyShare server running on http://localhost:${PORT}`);
});
