import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';

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
      // Avoid overwriting local typing (best-effort)
      isLocalChangeRef.current = false;
      setCode(updatedCode ?? '');
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

  // Emit code change to server (debounced-ish)
  const emitChange = useCallback((newCode) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('code-change', newCode);
    }
  }, []);

  const handleEditorChange = useCallback((value) => {
    const newCode = value ?? '';
    setCode(newCode);
    isLocalChangeRef.current = true;
    emitChange(newCode);
  }, [emitChange]);

  return (
    <div className="container">
      <div className="header">
        <h1>PyShare</h1>
        <div className="status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="editor-container" style={{ flex: 1, padding: 20 }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          language="python"
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: 'on',
            automaticLayout: true
          }}
        />
      </div>

      <div className="info">
        <p>💡 Share this URL with others to collaborate in real-time!</p>
      </div>
    </div>
  );
}

export default App;
