# ---- Builder Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts 2>/dev/null || npm install

# Copy source and compile contracts
COPY hardhat.config.js ./
COPY contracts/ ./contracts/
RUN npx hardhat compile

# ---- Runtime Stage ----
FROM node:20-alpine AS runtime

WORKDIR /app

# Create non-root user
RUN addgroup -S polkalend && adduser -S polkalend -G polkalend

# Copy dependencies and compiled artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/artifacts ./artifacts
COPY --from=builder /app/cache ./cache

# Copy application files
COPY package.json hardhat.config.js ./
COPY contracts/ ./contracts/
COPY scripts/ ./scripts/
COPY frontend/ ./frontend/

# Set ownership
RUN chown -R polkalend:polkalend /app

USER polkalend

# Hardhat node + frontend static server
EXPOSE 8545 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8545/ || exit 1

CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
