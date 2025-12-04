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

Question 4:
Replace the simple HTML VS Code in my React App with 'react-monaco-editor' (or Monaco Editor) to support Python syntax highlighting. Ensure the real-time sync still works when the editor content changes.

Question 5:
I want to execute the Python code inside the browser safely. Add the 'pyodide' library to my React frontend. Add a 'Run Code' button that:

Loads Pyodide.

Executes the code currently in the editor.

Displays the output (print statements) in a 'Console' div below the editor

Question 6:
Help me containerize this application. Create a single Dockerfile that:

Builds the React frontend (Vite build).

Sets up the Node.js backend.

Serves the static frontend files using the Node backend.
Use a standard Node.js base image.

Question 7:
I want to deploy this to Render.com. What settings should I use? (e.g., Build Command, Start Command).