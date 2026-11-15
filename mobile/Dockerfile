# App del vecino y del conductor (Expo), en su versión web, servida con nginx.
# En el teléfono se usa Expo Go o una build propia; este contenedor sirve la versión para navegador.
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# La URL de la API se fija al exportar: es la que usa el navegador
ARG EXPO_PUBLIC_API_URL=http://localhost:4000/api
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
RUN npx expo export --platform web --output-dir dist

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
