const jwt = require("jsonwebtoken");

const userSockets = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    const token = socket.handshake?.auth?.token;
    if (!token) return socket.disconnect();

    let userId;
    try {
      userId = jwt.verify(token, process.env.JWT_SECRET).id;
    } catch {
      return socket.disconnect();
    }

    socket.on("join", () => {
      userSockets.set(String(userId), socket.id);
      socket.emit("onlineUsers", Array.from(userSockets.keys()));
      io.emit("userOnline", String(userId));
    });

    socket.on("sendMessage", (message) => {
      if (!message?.receiverId || String(message.senderId) !== String(userId)) return;
      const receiverSocket = userSockets.get(String(message.receiverId));
      if (receiverSocket) io.to(receiverSocket).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      if (userSockets.get(String(userId)) === socket.id) {
        userSockets.delete(String(userId));
        io.emit("userOffline", String(userId));
      }
    });
  });
};
