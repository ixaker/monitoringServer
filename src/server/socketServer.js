import http from 'http';
import createWebSocketServer from './api/ws.js';

export default function startServer() {
  const server = http.createServer();
  
  // Створюємо WebSocket сервер та передаємо йому http сервер
  createWebSocketServer(server);

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}