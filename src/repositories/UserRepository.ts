import { TransactionClient } from "@/app/lib/init";
import {
    IUserRepository,
    UserRecordRepositoryResponse,
    UserRecordsRepositoryResponse,
} from "./IUserRepository";
import { IUserDatabase } from "@/infrastructures/IUserDatabase";

export class UserRepository implements IUserRepository {
    constructor(private db: IUserDatabase) {}

    async getUsersByDisplayName(displayName: string): Promise<UserRecordsRepositoryResponse> {
        return await this.db.findAllByDisplayName(displayName);
    }

    async updateUser(
        tx: TransactionClient,
        userId: string,
        email: string,
        displayName: string,
    ): Promise<UserRecordRepositoryResponse> {
        return await this.db.update(tx, userId, email, displayName);
    }
}
