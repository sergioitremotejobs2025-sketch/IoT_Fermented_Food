FROM python:3.9.2-alpine

WORKDIR /app

ENV PYTHONUNBUFFERED 1

COPY --chown=appuser:appgroup requirements.txt ./
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appgroup src/ ./src/

# Create a non-root user
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

CMD [ "python", "src/main.py" ]
