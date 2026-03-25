import { IUserRepository } from "@/repositories/IUserRepository";
import { IUserService, UserRecordsServiceResponse } from "./IUserService";

export class UserService implements IUserService {
    constructor(private repository: IUserRepository) {}

    async getUsersByDisplayName(displayName: string): Promise<UserRecordsServiceResponse> {
        return await this.repository.getUsersByDisplayName(displayName);
    }
}
