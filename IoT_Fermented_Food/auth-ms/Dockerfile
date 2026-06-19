# Build Stage
FROM golang:1.23-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . ./
RUN go build -o main .

# Run Stage
FROM alpine:3.19

WORKDIR /app

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only the binary
COPY --from=build /app/main .

# Use the non-root user
USER appuser

EXPOSE 3000

CMD [ "./main" ]
