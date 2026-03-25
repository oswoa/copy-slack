import { IUserRepository, UserRecordsRepositoryResponse } from "./IUserRepository";
import { IUserDatabase } from "@/infrustructures/IUserDatabase";

export class UserRepository implements IUserRepository {
    constructor(private db: IUserDatabase) {}

    async getUsersByDisplayName(displayName: string): Promise<UserRecordsRepositoryResponse> {
        return await this.db.findAllByDisplayName(displayName);
    }
}
