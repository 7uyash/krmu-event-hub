FROM node:18-alpine

WORKDIR /app

# Copy package config
COPY package*.json ./

# Install cleanly
RUN npm install --production

# Copy source
COPY . .

# Expose backend port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
