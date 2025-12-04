import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';

function App() {
  const [code, setCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const isLocalChangeRef = useRef(false);
  const pyodideRef = useRef(null);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');

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

  // Load Pyodide (via CDN) once
  const loadPyodideIfNeeded = useCallback(async () => {
    if (pyodideRef.current) return pyodideRef.current;
    setPyodideLoading(true);
    try {
      if (!window.loadPyodide) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      // loadPyodide is provided by the script
      // eslint-disable-next-line no-undef
      const pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/' });
      pyodideRef.current = pyodide;
      return pyodide;
    } finally {
      setPyodideLoading(false);
    }
  }, []);

  const runCodeInPyodide = useCallback(async () => {
    setConsoleOutput('');
    try {
      const pyodide = await loadPyodideIfNeeded();

      // Set up a simple stdout capturer in Python
      await pyodide.runPythonAsync(`
import sys
class _ConsoleCapture:
    def __init__(self):
        self.output = ''
    def write(self, s):
        self.output += str(s)
    def flush(self):
        pass
_console_capture = _ConsoleCapture()
sys.stdout = _console_capture
sys.stderr = _console_capture
`);

      // Execute user code (async-safe)
      await pyodide.runPythonAsync(code || '');

      // Retrieve output
      const output = pyodide.runPython('getattr(_console_capture, "output", "")');
      setConsoleOutput(String(output));
    } catch (err) {
      setConsoleOutput(String(err));
    }
  }, [code, loadPyodideIfNeeded]);

  return (
    <div className="container">
      <div className="header">
        <h1>PyShare</h1>
        <div className="status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="editor-container" style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <Editor
            height="60vh"
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

        <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="run-btn" onClick={runCodeInPyodide} disabled={pyodideLoading}>
            {pyodideLoading ? 'Loading Pyodide...' : 'Run Code'}
          </button>
          <div style={{ color: '#6b7280' }}>{pyodideLoading ? 'Pyodide is loading (first run) — please wait.' : ''}</div>
        </div>

        <div className="console" style={{ marginTop: 12 }}>
          <div className="console-header">Console</div>
          <pre className="console-body">{consoleOutput || <span style={{ color: '#9ca3af' }}>No output</span>}</pre>
        </div>

        <div className="info">
          <p>💡 Share this URL with others to collaborate in real-time!</p>
        </div>
      </div>
    </div>
  );
}

export default App;
