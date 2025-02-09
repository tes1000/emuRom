# Use Node.js 20 for the build stage to handle EmulatorJS minification
FROM node:20 AS builder

WORKDIR /app

# Install Bun and Node.js dependencies
RUN curl -fsSL https://bun.sh/install | bash && \
    apt-get update && apt-get install -y python3 make g++
ENV PATH="/root/.bun/bin:$PATH"

# Copy package files
COPY package.json ./

# Copy full project files
COPY . .

# Install project dependencies
RUN bun install

# Build Next.js frontend
WORKDIR /app
RUN bun run build

# Production image with Bun
FROM oven/bun:1.0.0 AS production

WORKDIR /app

# Copy built project from builder
COPY --from=builder /app .

EXPOSE 3000
CMD ["bun", "run", "server.js"]