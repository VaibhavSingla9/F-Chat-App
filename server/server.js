import express from 'express'
import "dotenv/config";
import cors from 'cors'
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import {Server} from 'socket.io'

import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// create the express app and the http server
const app = express();

const server = app.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});



// Initialize socket.io server
export const io = new Server(server , {
    cors: {origin:"*"}
})

// store online users
export const userSocketMap= {};   //{userId : socketId}

// socket.io connection handler
io.on("connection" , (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected" , userId)

    // when the user is available then we add the data in the userSocketMap
    if(userId) userSocketMap[userId] = socket.id

    // Emit online users to all connected clients
    io.emit("getOnlineUsers" ,  Object.keys(userSocketMap));

    socket.on("disconnect" ,()=>{
        console.log("User Disconnected" , userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers" , Object.keys(userSocketMap))
    })
})


// Middleware setup 
app.use(express.json({limit:"4mb"}))
app.use(cors())

// Route Setup
app.get("/", (req,res)=>{
    res.send("Server is liveeeeee!!!!")
})
app.use("/api/status" ,(req,res)=>res.send("Server is live") )
app.use("/api/auth" , userRouter)
app.use("/api/messages" , messageRouter)


// connect ot mongodb
 await connectDB();



// const PORT = process.env.PORT || 5000;
// server.listen(PORT ,()=>console.log("Server is running on PORT: : " + PORT))

// exporting server for vercel
export default server;