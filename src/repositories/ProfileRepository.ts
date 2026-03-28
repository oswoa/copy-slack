import { IProfileRepository, ProfileRepositoryResponse } from "./IProfileRepository";
import { IProfileDatabase } from "@/infrustructures/IProfileDatabase";

export class ProfileRepository implements IProfileRepository {
    constructor(private db: IProfileDatabase) {}

    async getProfile(userId: string): Promise<ProfileRepositoryResponse> {
        return await this.db.findByUserId(userId);
    }

    async createProfile(
        userId: string,
        imageUrl: string,
        file?: File,
    ): Promise<ProfileRepositoryResponse> {
        return await this.db.create(userId, imageUrl, file);
    }
}
