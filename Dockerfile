# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# Set environment variables for production build
ENV VITE_API_URL="http://4.216.217.194:5000"
ENV VITE_SIGNALR_URL="http://4.216.217.194:5000/api/v1/hubs/notification"

RUN npm run build

# Serve stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
