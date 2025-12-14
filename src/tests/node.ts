import { setupServer } from "msw/node";
import { handlers } from "./handlers.js";

// MSWサーバーのセットアップ
export const server = setupServer(...handlers);
