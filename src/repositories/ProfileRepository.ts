import { TransactionClient } from "@/app/lib/init";
import { IProfileRepository, ProfileRepositoryResponse } from "./IProfileRepository";
import { IProfileDatabase } from "@/infrastructures/IProfileDatabase";

export class ProfileRepository implements IProfileRepository {
    constructor(private db: IProfileDatabase) {}

    async getProfile(userId: string): Promise<ProfileRepositoryResponse> {
        return await this.db.findByUserId(userId);
    }

    async updateProfile(
        tx: TransactionClient,
        userId: string,
        file: File,
    ): Promise<ProfileRepositoryResponse> {
        return await this.db.update(tx, userId, file);
    }
}
