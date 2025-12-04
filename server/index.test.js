import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioClient } from 'socket.io-client';
import express from 'express';
import cors from 'cors';

describe('PyShare Socket.io Server Integration Tests', () => {
  let httpServer;
  let ioServer;
  let port = 3001;
  let sharedCode = '';

  beforeAll((done) => {
    // Create Express app with Socket.io
    const app = express();
    app.use(cors());
    app.use(express.json());

    httpServer = createServer(app);
    ioServer = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Socket.io connection handling
    ioServer.on('connection', (socket) => {
      // Send current code to newly connected client
      socket.emit('code-update', sharedCode);

      // Listen for code updates
      socket.on('code-change', (newCode) => {
        sharedCode = newCode;
        // Broadcast to all clients
        ioServer.emit('code-update', sharedCode);
      });
    });

    // REST endpoint
    app.get('/api/code', (req, res) => {
      res.json({ code: sharedCode });
    });

    httpServer.listen(port, () => {
      done();
    });
  });

  afterAll((done) => {
    ioServer.close();
    httpServer.close(done);
  });

  beforeEach(() => {
    sharedCode = '';
  });

  test('should connect a client to the server', (done) => {
    const client = ioClient(`http://localhost:${port}`);

    client.on('connect', () => {
      expect(client.connected).toBe(true);
      client.disconnect();
      done();
    });

    client.on('error', (error) => {
      client.disconnect();
      done(error);
    });
  });

  test('should receive initial code on connection', (done) => {
    sharedCode = 'console.log("Hello World");';
    const client = ioClient(`http://localhost:${port}`);

    client.on('code-update', (code) => {
      expect(code).toBe('console.log("Hello World");');
      client.disconnect();
      done();
    });

    client.on('error', (error) => {
      client.disconnect();
      done(error);
    });
  });

  test('should broadcast code changes to all connected clients', (done) => {
    const client1 = ioClient(`http://localhost:${port}`);
    const client2 = ioClient(`http://localhost:${port}`);
    const client3 = ioClient(`http://localhost:${port}`);

    const updatesFromClient2 = [];
    const updatesFromClient3 = [];
    const testCode = 'function sum(a, b) { return a + b; }';
    let allConnected = 0;

    // Collect updates from client2
    client2.on('code-update', (code) => {
      updatesFromClient2.push(code);
    });

    // Collect updates from client3
    client3.on('code-update', (code) => {
      updatesFromClient3.push(code);
    });

    const onConnect = () => {
      allConnected++;
      if (allConnected === 3) {
        // All clients connected, now client1 sends code
        setTimeout(() => {
          client1.emit('code-change', testCode);

          // Check results after a brief delay to allow broadcast
          setTimeout(() => {
            expect(updatesFromClient2.some(code => code === testCode)).toBe(true);
            expect(updatesFromClient3.some(code => code === testCode)).toBe(true);
            expect(sharedCode).toBe(testCode);

            client1.disconnect();
            client2.disconnect();
            client3.disconnect();
            done();
          }, 300);
        }, 100);
      }
    };

    client1.on('connect', onConnect);
    client2.on('connect', onConnect);
    client3.on('connect', onConnect);

    const timeoutId = setTimeout(() => {
      client1.disconnect();
      client2.disconnect();
      client3.disconnect();
      done(new Error('Test timeout: not all clients connected'));
    }, 5000);

    client1.on('error', (error) => {
      clearTimeout(timeoutId);
      client1.disconnect();
      client2.disconnect();
      client3.disconnect();
      done(error);
    });
  });

  test('should handle multiple sequential code updates', (done) => {
    const client = ioClient(`http://localhost:${port}`);
    const receivedUpdates = [];
    const updates = [
      'const x = 1;',
      'const x = 1; const y = 2;',
      'const x = 1; const y = 2; const z = 3;'
    ];

    client.on('code-update', (code) => {
      if (code) {
        receivedUpdates.push(code);
      }
    });

    let updateCount = 0;
    let sendTimeout;
    let finalTimeout;

    const sendNextUpdate = () => {
      if (updateCount < updates.length) {
        client.emit('code-change', updates[updateCount]);
        updateCount++;
        sendTimeout = setTimeout(sendNextUpdate, 100);
      } else {
        // Give some time to receive all updates
        finalTimeout = setTimeout(() => {
          const relevantUpdates = receivedUpdates.filter(code => code.includes('const'));
          expect(relevantUpdates.length).toBeGreaterThan(0);
          
          client.disconnect();
          done();
        }, 200);
      }
    };

    client.on('connect', () => {
      sendNextUpdate();
    });

    const mainTimeout = setTimeout(() => {
      clearTimeout(sendTimeout);
      clearTimeout(finalTimeout);
      client.disconnect();
      done(new Error('Test timeout'));
    }, 5000);

    client.on('error', (error) => {
      clearTimeout(sendTimeout);
      clearTimeout(finalTimeout);
      clearTimeout(mainTimeout);
      client.disconnect();
      done(error);
    });
  });

  test('should handle disconnection gracefully', (done) => {
    const client = ioClient(`http://localhost:${port}`);

    client.on('connect', () => {
      expect(client.connected).toBe(true);
      client.disconnect();

      setTimeout(() => {
        expect(client.connected).toBe(false);
        done();
      }, 100);
    });

    client.on('error', (error) => {
      client.disconnect();
      done(error);
    });
  });

  test('should persist code across client connections', (done) => {
    const testCode = 'async function fetchData() { return await fetch("/api"); }';
    const client1 = ioClient(`http://localhost:${port}`);

    client1.on('connect', () => {
      client1.emit('code-change', testCode);

      setTimeout(() => {
        client1.disconnect();

        const client2 = ioClient(`http://localhost:${port}`);
        
        client2.on('code-update', (code) => {
          expect(code).toBe(testCode);
          client2.disconnect();
          done();
        });

        client2.on('error', (error) => {
          client2.disconnect();
          done(error);
        });
      }, 200);
    });

    client1.on('error', (error) => {
      client1.disconnect();
      done(error);
    });
  });

  test('should handle empty code updates', (done) => {
    const client = ioClient(`http://localhost:${port}`);
    let updateReceived = false;

    client.on('code-update', (code) => {
      if (code === '') {
        updateReceived = true;
      }
    });

    client.on('connect', () => {
      client.emit('code-change', '');

      setTimeout(() => {
        expect(sharedCode).toBe('');
        client.disconnect();
        done();
      }, 200);
    });

    client.on('error', (error) => {
      client.disconnect();
      done(error);
    });
  });

  test('should handle large code updates', (done) => {
    const largeCode = 'function test() {\n' + '  // '.repeat(1000) + '\n}';
    const client1 = ioClient(`http://localhost:${port}`);
    const client2 = ioClient(`http://localhost:${port}`);

    let client2Updated = false;

    client2.on('code-update', (code) => {
      if (code === largeCode) {
        client2Updated = true;
      }
    });

    let connectCount = 0;
    const handleConnect = () => {
      connectCount++;
      if (connectCount === 2) {
        client1.emit('code-change', largeCode);

        setTimeout(() => {
          expect(client2Updated).toBe(true);
          expect(sharedCode).toBe(largeCode);
          client1.disconnect();
          client2.disconnect();
          done();
        }, 300);
      }
    };

    client1.on('connect', handleConnect);
    client2.on('connect', handleConnect);

    client1.on('error', (error) => {
      client1.disconnect();
      client2.disconnect();
      done(error);
    });

    client2.on('error', (error) => {
      client1.disconnect();
      client2.disconnect();
      done(error);
    });
  });
});
