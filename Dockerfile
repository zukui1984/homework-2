# Multi-stage Dockerfile for PyShare
# Stage 1: Build frontend
FROM node:20-bullseye as build
WORKDIR /app

# Copy client files and install/build
COPY client/package.json client/package-lock.json* ./client/
COPY client/ ./client/
RUN cd client && npm install && npm run build

# Stage 2: Setup server and copy built frontend
FROM node:20-bullseye-slim
WORKDIR /app

# Create non-root user for better security
RUN useradd --user-group --create-home --shell /bin/false appuser || true

# Copy server files
COPY server/package.json server/package-lock.json* ./server/
COPY server/ ./server/

# Copy built frontend into server/public
COPY --from=build /app/client/dist ./server/public

# Install server dependencies
RUN cd server && npm install --production

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Use non-root user
USER appuser

# Start server
CMD [ "node", "server/index.js" ]
