# PyShare - Real-time Code Sharing Application - https://pyshare-r0kq.onrender.com

A simple full-stack application for real-time code sharing using React, Node.js, Express, and Socket.io.

## Project Structure

```
homework-2/
├── server/
│   ├── index.js                 # Express server with Socket.io
│   ├── package.json            # Server dependencies
│   └── .gitignore
├── client/
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Styling
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
│   ├── package.json            # Client dependencies
│   └── .gitignore
└── README.md
```

## Features

✨ **Real-time Synchronization**: Code updates are instantly synchronized across all connected clients using Socket.io
📝 **Simple Text Area**: Clean and intuitive interface for typing code
🚀 **In-Memory Storage**: No database required; code is stored in server memory
🔌 **Live Connection Status**: Visual indicator showing connection status
🎨 **Modern UI**: Beautiful gradient design with smooth animations

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Server Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

### Client Setup

1. Open a new terminal and navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:5173`

## How to Use

1. Open your browser and go to `http://localhost:5173`
2. You should see the PyShare application with a text area
3. Start typing code in the text area
4. The code will be synchronized in real-time to any other clients connected to the same server
5. To test with multiple clients, open the URL in another browser tab or window

## How It Works

### Backend (Server)
- **Express Server**: Serves HTTP requests and handles REST endpoints
- **Socket.io**: Manages real-time WebSocket connections
- **In-Memory Storage**: Maintains the shared code in a variable
- **Event Broadcasting**: When any client sends a code update, the server broadcasts it to all connected clients

### Frontend (Client)
- **React**: Component-based UI framework
- **Socket.io Client**: Connects to the server and handles real-time events
- **State Management**: Uses React hooks (useState) to manage code state
- **Connection Status**: Displays visual feedback for server connectivity

## Architecture Flow

```
Client 1 (Types Code)
    ↓
    └─→ Socket.io Event: 'code-change'
         ↓
         Server (Stores in Memory + Broadcasts)
         ↓
    ┌────────────────────┐
    ↓                    ↓
 Client 1            Client 2 (Receives Update)
(Updates)           (Updates)
```

## API Endpoints

### REST Endpoints
- `GET /api/code` - Retrieve the current shared code

### Socket.io Events

**Client to Server:**
- `code-change` - Emitted when the client updates the code

**Server to Client:**
- `code-update` - Emitted when code is updated (includes current code)

## Development

### Running in Watch Mode

**Server:**
```bash
npm run dev
```

**Client:**
```bash
npm run dev
```

### Building for Production

**Client Build:**
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Technologies Used

- **Frontend**: React 18, Vite, Socket.io Client
- **Backend**: Node.js, Express, Socket.io
- **Styling**: CSS3 with gradients and animations

## Notes

- Code is stored in server memory only; it will be reset when the server restarts
- Multiple clients can connect and edit simultaneously
- Changes are instantly visible to all connected clients
- The application automatically reconnects if the connection is lost

## Future Enhancements

- Persistent storage using a database (MongoDB, PostgreSQL)
- User authentication and authorization
- Code syntax highlighting with syntax themes
- Undo/Redo functionality
- User cursors and presence indicators
- Code execution environment
- Collaborative features (user names, avatars)

## License

MIT License
