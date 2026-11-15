# API REST de Recolecta+ (Node.js + Express) con el servicio de IA en Python (K-Means).
# La API ejecuta ai/cluster_service.py al pulsar «Optimizar rutas con IA», así que la imagen lleva ambos.
FROM node:22-bookworm-slim

# Python 3.11 de Debian y las librerías del agrupamiento en un entorno virtual
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 python3-venv \
 && rm -rf /var/lib/apt/lists/*
COPY ai/requirements.txt /tmp/ai-requirements.txt
RUN python3 -m venv /opt/venv \
 && /opt/venv/bin/pip install --no-cache-dir -r /tmp/ai-requirements.txt
ENV PYTHON_BIN=/opt/venv/bin/python

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .

ENV NODE_ENV=production \
    PORT=4000
EXPOSE 4000

# Crea la base si falta, aplica el esquema y el ubigeo (se puede repetir sin perder datos) y arranca la API
CMD ["sh", "-c", "node scripts/initDb.js && node server.js"]
