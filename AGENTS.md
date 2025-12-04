Question 1:
Create a simple full-stack application called 'PyShare'.
Frontend: React with Vite.
Backend: Node.js + Express + Socket.io.
Features:

A simple text area where I can type code.

Real-time synchronization: When I type in the client, it should update for all other connected clients instantly using Socket.io.

No database is needed; just keep the current code in memory on the server.
Please provide the file structure and the code for the server (index.js) and the client (App.jsx)

Question 2:
I need to verify that my backend works. Create an integration test file using 'Jest' and 'Supertest' (or Vitest) that connects to my Socket.io server, sends a 'code_update' event, and verifies that the server broadcasts it back to other clients. Also, create a README.md listing how to run these tests.

Question 3:
I want to run both my backend (port 3000) and my frontend (Vite) with a single command. Help me configure 'concurrently' in the root package.json to run both servers at once with 'npm run dev'.

