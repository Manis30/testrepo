FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Install dependencies first so this layer is cached until package files change
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the rest of the source (anything in .dockerignore is skipped)
COPY . .

# Run as the non-root user that ships with the node image
USER node

EXPOSE 4000

# Marks the container unhealthy if /health stops responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||4000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Uses whatever "start" is in package.json, so it works with your file layout
CMD ["npm", "start"]