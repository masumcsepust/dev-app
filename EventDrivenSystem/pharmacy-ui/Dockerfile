# ── Build ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --prefer-offline

# Copy source and build for production
COPY . .
RUN npm run build -- --configuration=production

# ── Serve with nginx ────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS final

# Angular 17+ outputs to dist/<project>/browser
COPY --from=build /app/dist/pharmacy-ui/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80