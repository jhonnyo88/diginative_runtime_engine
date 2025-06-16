# DigiNativa Runtime Engine - Production Docker Container
# Optimized for 10,000+ concurrent users in Swedish municipal sector

# Stage 1: Build Environment
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files for dependency caching
COPY package*.json ./

# Install dependencies with production optimizations
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy source code
COPY . .

# Build application for production
RUN npm run build

# Stage 2: Production Environment
FROM nginx:alpine AS production

# Install security updates
RUN apk upgrade --no-cache

# Create non-root user for security
RUN addgroup -g 1001 -S diginativa && \
    adduser -S diginativa -u 1001 -G diginativa

# Copy custom nginx configuration
COPY --chown=diginativa:diginativa nginx.conf /etc/nginx/nginx.conf
COPY --chown=diginativa:diginativa nginx-site.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder --chown=diginativa:diginativa /app/dist /usr/share/nginx/html

# Create necessary directories
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R diginativa:diginativa /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Security: Run as non-root user
USER diginativa

# Expose port
EXPOSE 8080

# Labels for container metadata
LABEL maintainer="DigiNativa Development Team"
LABEL version="1.0.0"
LABEL description="DigiNativa Runtime Engine - Swedish Municipal Education Platform"
LABEL org.label-schema.name="diginativa-runtime-engine"
LABEL org.label-schema.description="Enterprise game-based learning platform for Swedish municipalities"
LABEL org.label-schema.url="https://github.com/jhonnyo88/diginative_runtime_engine"
LABEL org.label-schema.vendor="DigiNativa"
LABEL org.label-schema.schema-version="1.0"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]