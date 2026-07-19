FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci

FROM dependencies AS backend-build
COPY backend backend
RUN npm run build --workspace backend

FROM node:20-alpine AS backend
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --omit=dev --workspace backend && npm cache clean --force
COPY --from=backend-build /app/backend/dist backend/dist
RUN mkdir -p backend/uploads && chown -R node:node /app/backend
USER node
EXPOSE 5000
CMD ["node", "backend/dist/server.js"]

FROM dependencies AS frontend-build
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY frontend frontend
RUN npm run build --workspace frontend

FROM nginx:1.27-alpine AS frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
