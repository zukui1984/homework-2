import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Serve static frontend (if present)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticPath = path.join(__dirname, 'public');
if (process.env.NODE_ENV === 'production' || true) {
  // Serve built client files from server/public (copied there by Dockerfile or deploy process)
  app.use(express.static(staticPath));
  // For SPA client-side routing, return index.html for unknown routes
  app.get(/^(?!\/api).*/, (req, res) => {
    const indexHtml = path.join(staticPath, 'index.html');
    res.sendFile(indexHtml, (err) => {
      if (err) res.status(404).end();
    });
  });
}

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
