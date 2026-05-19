import { io } from "socket.io-client";

const port = process.env.NEXT_PUBLIC_SOCKET_PORT;
const SOCKET_SERVER = `localhost:${port}`;

const socket = io(SOCKET_SERVER);
export const getSocket = () => socket;
