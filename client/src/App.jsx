import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

function App() {
  const [code, setCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const isLocalChangeRef = useRef(false);

  useEffect(() => {
    // Connect to the server
    socketRef.current = io('http://localhost:3000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Listen for connection
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    // Listen for code updates from server
    socketRef.current.on('code-update', (updatedCode) => {
      setCode(updatedCode);
      isLocalChangeRef.current = false;
    });

    // Listen for disconnection
    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    // Listen for connection errors
    socketRef.current.on('error', (error) => {
      console.error('Connection error:', error);
    });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Handle code changes
  const handleCodeChange = (event) => {
    const newCode = event.target.value;
    setCode(newCode);
    isLocalChangeRef.current = true;

    // Emit code change to server
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('code-change', newCode);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>PyShare</h1>
        <div className="status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="editor-container">
        <textarea
          className="code-editor"
          value={code}
          onChange={handleCodeChange}
          placeholder="Start typing code here... It will be synchronized in real-time across all connected clients!"
        />
      </div>

      <div className="info">
        <p>💡 Share this URL with others to collaborate in real-time!</p>
      </div>
    </div>
  );
}

export default App;
