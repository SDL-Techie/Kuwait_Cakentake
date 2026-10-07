FROM node:22-bookworm-slim AS frontend-build

WORKDIR /build/frontend
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY frontend-web/package.json frontend-web/package-lock.json ./
RUN npm ci
COPY frontend-web/ ./
ARG VITE_API_BASE_URL
ARG VITE_N8N_CHAT_WEBHOOK_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_N8N_CHAT_WEBHOOK_URL=${VITE_N8N_CHAT_WEBHOOK_URL}
RUN npm run build

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
COPY --from=frontend-build /build/frontend/dist ./dist
RUN useradd --create-home appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "app:app"]