import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3000 });
const rooms = new Map(); // sesión → conexiones

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    let data;
    try { data = JSON.parse(msg); } catch { return; }

    if (data.join) {
      ws.session = data.join;
      if (!rooms.has(ws.session)) rooms.set(ws.session, new Set());
      rooms.get(ws.session).add(ws);
      return;
    }

    // broadcast a todos los del mismo "room"
    if (ws.session && data.broadcast && data.payload) {
      for (const peer of rooms.get(ws.session) || []) {
        if (peer.readyState === 1) {
          peer.send(JSON.stringify(data.payload));
        }
      }
    }
  });

  ws.on("close", () => {
    if (ws.session && rooms.has(ws.session))
      rooms.get(ws.session).delete(ws);
  });
});

console.log("Servidor WS listo en ws://localhost:3000");