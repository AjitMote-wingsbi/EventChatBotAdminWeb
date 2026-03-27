# 1. Build Stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Declare VITE_ build args — each defaults to its own name as a runtime placeholder.
# The built JS bundle will contain the placeholder string (e.g. "VITE_API_BASE_URL")
# which gets swapped for the real value at container startup from Azure App Settings.
ARG VITE_API_BASE_URL=VITE_API_BASE_URL
ARG VITE_CHATBOT_WIDGET_URL=VITE_CHATBOT_WIDGET_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CHATBOT_WIDGET_URL=$VITE_CHATBOT_WIDGET_URL

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies using npm
RUN npm ci

# Copy the rest of the project (including public & src)
COPY . .

# Build the project (Vite outputs to 'dist')
RUN npm run build

# 2. Production Stage (Nginx)
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build output to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA fallback (optional but recommended)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# At startup, replace every VITE_* placeholder in the JS/HTML bundle with the actual
# value from Azure App Settings, then start Nginx.
CMD ["/bin/sh", "-c", "for var in $(printenv | grep '^VITE_' | cut -d= -f1); do value=$(printenv \"$var\"); find /usr/share/nginx/html -type f \\( -name '*.js' -o -name '*.html' \\) | xargs sed -i \"s|${var}|${value}|g\"; done && nginx -g 'daemon off;'"]