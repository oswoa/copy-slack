import { PrismaClient } from "@prisma/client";

export const BASE_URL = "http://localhost:3030";
export const prisma = new PrismaClient({
    omit: {
        user: {
            password: true,
            token: true,
        },
    },
});
