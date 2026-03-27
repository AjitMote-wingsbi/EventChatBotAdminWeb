FROM node:20-alpine AS builder

WORKDIR /app

# Accept API URL as a build argument (for CI/CD build environments)
ARG VITE_API_BASE_URL
# Pass it to Vite build (defaults to a placeholder if not provided)
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-VITE_API_BASE_URL_PLACEHOLDER}

ARG VITE_CHATBOT_WIDGET_URL
ENV VITE_CHATBOT_WIDGET_URL=${VITE_CHATBOT_WIDGET_URL:-VITE_CHATBOT_WIDGET_URL_PLACEHOLDER}

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Production stage using Nginx
FROM nginx:alpine

# Copy built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace the default Nginx configuration to support SPA routing
RUN printf "server {\n\
    listen 80;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files \$uri \$uri/ /index.html;\n\
    }\n\
}\n" > /etc/nginx/conf.d/default.conf

EXPOSE 80

# This startup command dynamically replaces the placeholder with the runtime environment variable.
# It allows Azure App Service to set VITE_API_BASE_URL via App Settings without rebuilding the image.
CMD ["/bin/sh", "-c", "find /usr/share/nginx/html -type f -name '*.js' -exec sed -i \"s|VITE_API_BASE_URL_PLACEHOLDER|${VITE_API_BASE_URL}|g\" {} + && find /usr/share/nginx/html -type f -name '*.js' -exec sed -i \"s|VITE_CHATBOT_WIDGET_URL_PLACEHOLDER|${VITE_CHATBOT_WIDGET_URL}|g\" {} + && nginx -g 'daemon off;'"]
