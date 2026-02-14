import { Server } from "socket.io";

function initSocketServer(httpRef:any){
    const io = new Server(httpRef);
    console.warn("Socket.IO server initialized");
    io.on("connection", (socket:any) => {
        console.warn("New client connected", socket.id);
        socket.on("disconnect", () => {
            console.warn("Client disconnected", socket.id);
        });
    });
    return io;
}

export default initSocketServer;