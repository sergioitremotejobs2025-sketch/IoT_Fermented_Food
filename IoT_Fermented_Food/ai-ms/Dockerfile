FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create a non-root user and set permissions
RUN groupadd -g 1000 appgroup && \
    useradd -u 1000 -g 1000 -r -s /bin/false appuser && \
    chown -R appuser:appgroup /app

USER appuser

WORKDIR /app/src
ENV PORT=5000
ENV PYTHONPATH=/app/src
ENV PYTHONUNBUFFERED=1
EXPOSE 5000

CMD ["python", "main.py"]
