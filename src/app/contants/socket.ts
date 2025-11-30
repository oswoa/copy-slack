import { io } from "socket.io-client";

const port = process.env.SOCKET_PORT ? process.env.SOCKET_PORT : "3001";
const SOCKET_SERVER = `localhost:${port}`;

export const socket = io(SOCKET_SERVER);
