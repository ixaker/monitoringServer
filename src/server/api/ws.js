import { Server } from "socket.io";

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Отримано POST запит, обробка даних
    const data = req.body;
    console.log("Received data:", data);

    // Відправляємо додаткові дані через веб-сокет
    if (socket) {
      socket.emit("data", data);
    }

    // Повертаємо успішну відповідь
    res.status(200).json({ message: "Data received successfully" });
  } else {
    // Інші методи запитів не підтримуються
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

let io;

// Створюємо веб-сокет сервер
if (!io) {
  const httpServer = require("http").createServer(handler);
  io = new Server(httpServer, {
    /* options */
  });

  // Обробник підключення нового клієнта
  io.on("connection", (socket) => {
    console.log("A client connected");

    // Обробник відключення клієнта
    socket.on("disconnect", () => {
      console.log("A client disconnected");
    });
  });

  // Запускаємо веб-сокет сервер
  httpServer.listen(3001, () => {
    console.log("WebSocket server is running on port 3001");
  });
}