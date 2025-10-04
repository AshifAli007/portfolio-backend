const sockets = new Set<WebSocket>();

export default {
  fetch(request: Request): Response {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("WebSocket endpoint", { status: 200 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    server.accept();
    sockets.add(server);

    server.addEventListener("message", (evt: MessageEvent) => {
      for (const ws of sockets) if (ws.readyState === ws.OPEN) ws.send(evt.data);
    });

    const cleanup = () => sockets.delete(server);
    server.addEventListener("close", cleanup);
    server.addEventListener("error", cleanup);

    return new Response(null, { status: 101, webSocket: client });
  },
};