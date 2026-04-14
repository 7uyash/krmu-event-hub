FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies first for caching layer
COPY package*.json ./
RUN npm install

# Build the frontend payload, passing VITE_API_URL 
# We'll set it to /api so that Nginx handles the routing seamlessly based on the host domain
COPY . .
ENV VITE_API_URL=/api
RUN npm run build

# Serve stage using lightweight Nginx
FROM nginx:alpine

# Copy the build artifacts to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Replace the default Nginx config with our custom one
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
