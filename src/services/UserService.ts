import { IUserRepository } from "@/repositories/IUserRepository";
import {
    IUserService,
    UserRecordServiceResponse,
    UserRecordsServiceResponse,
} from "./IUserService";

export class UserService implements IUserService {
    constructor(private repository: IUserRepository) {}

    async getUsersByDisplayName(displayName: string): Promise<UserRecordsServiceResponse> {
        return await this.repository.getUsersByDisplayName(displayName);
    }

    async updateUser(
        userId: string,
        email: string,
        displayName: string,
    ): Promise<UserRecordServiceResponse> {
        return await this.repository.updateUser(userId, email, displayName);
    }
}
