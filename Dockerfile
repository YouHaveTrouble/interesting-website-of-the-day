# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Runtime Stage ----
FROM node:22-alpine AS runtime
WORKDIR /app

# Set environment variable to signal production mode
ENV NODE_ENV=production

# Copy only the necessary build artifacts and production node_modules
# Note: You might need 'npm ci --omit=dev' in the build stage for smaller node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set HOST env var to make the server listen on all interfaces within the container
ENV HOST="0.0.0.0"
# Set PORT env var (Astro Node adapter reads this)
ENV PORT="3000"

# Command to start the Node.js server produced by the Astro build
CMD ["node", "dist/server/entry.mjs"]
