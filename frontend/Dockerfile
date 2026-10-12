# Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /app

# Recebe a URL da API no momento do build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN test -n "$VITE_API_URL" || (echo "VITE_API_URL is required" && exit 1)
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copia configurações do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos gerados pelo build do React
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
