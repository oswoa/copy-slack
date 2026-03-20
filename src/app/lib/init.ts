import { AuthRepository } from "@/repositories/AuthRepository";
import { PrismaDatabase } from "@/infrustructures/Prisma";
import { AuthService } from "@/services/AuthService";

const db: PrismaDatabase = new PrismaDatabase();
const repository: AuthRepository = new AuthRepository(db);
export const service: AuthService = new AuthService(repository);
