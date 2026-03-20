import { AuthRepository } from "@/repositories/AuthRepository";
import { AuthDatabase } from "@/infrustructures/AuthDatabase";
import { AuthService } from "@/services/AuthService";

const db: AuthDatabase = new AuthDatabase();
const repository: AuthRepository = new AuthRepository(db);
export const service: AuthService = new AuthService(repository);
