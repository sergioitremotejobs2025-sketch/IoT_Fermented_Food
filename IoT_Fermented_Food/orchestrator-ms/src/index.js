const http = require('http');
const PORT = process.env.PORT || 3000;
const app = require('./app/app');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected to orchestrator-ms via WebSocket');
  socket.on('disconnect', () => {
    console.log('Client disconnected from orchestrator-ms');
  });
});

const QueueManager = require('./modules/queue.module');

// Attach io to app to make it accessible in routes
app.set('io', io);

// Initialize RabbitMQ consumer for real-time WebSocket streaming
new QueueManager(io);

server.listen(PORT, () => {
  console.log('orchestrator-ms with WebSockets at http://localhost:' + PORT);
});
