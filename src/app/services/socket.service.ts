import { Socket } from "socket.io";

(() => {
  const socket: Socket = ((globalThis as any).io as Socket);
  if (!socket) {
    throw new Error("Socket.IO not initialized");
  }
  console.warn("Init Socket Routes: ")

 // Create User 
  socket.on("createUser", (data:any) => {
    console.warn("Creating user:", data);
  });
  
})();
