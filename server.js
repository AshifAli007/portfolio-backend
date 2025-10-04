// server.js
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT, host: '0.0.0.0' });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  // Optional: keep connections alive
  ws.isAlive = true;
  ws.on('pong', () => (ws.isAlive = true));
});

const interval = setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  }
}, 30000);

wss.on('close', () => clearInterval(interval));

console.log(`WebSocket server running on port ${PORT}`);