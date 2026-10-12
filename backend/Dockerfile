FROM node:22-alpine

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose backend API port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Seed database and start server
CMD ["sh", "-c", "node src/database/seed.js && node src/server.js"]
