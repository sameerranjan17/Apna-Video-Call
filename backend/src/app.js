import "dotenv/config";

import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
// const io = new Server(server)
const io = connectToSocket(server); //initializing socket

app.set("port", process.env.PORT || 8000);
app.use(cors()); //we write this to tackle cross origin error
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes); //dono use kar sakte ek saath
// app.use("/api/v2/users", newUserRoutes);

const start = async () => {
  try {
    app.set("mongo_user");
    const connectionDb = await mongoose.connect(process.env.MONGO_URL);

    console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);
    server.listen(app.get("port"), () => {
      console.log(`LISTENIN ON PORT ${app.get("port")}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};


app.get("/", (req, res) => {
    res.json({ message: "Backend is running!" });
});

start();
