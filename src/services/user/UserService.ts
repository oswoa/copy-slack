import { IUserRepository } from "@/repositories/user/IUserRepository";
import {
    IUserService,
    UserRecordServiceResponse,
    UserRecordsServiceResponse,
} from "./IUserService";
import { AppPrismaClient } from "@/app/lib/init";
import { ErrorDetail } from "@/app/common/ErrorDetail";

export class UserService implements IUserService {
    constructor(
        private prisma: AppPrismaClient,
        private repository: IUserRepository,
    ) {}

    async getUsersByDisplayName(displayName: string): Promise<UserRecordsServiceResponse> {
        return await this.repository.getUsersByDisplayName(displayName);
    }

    async updateUser(
        userId: string,
        email: string,
        displayName: string,
    ): Promise<UserRecordServiceResponse> {
        try {
            return this.prisma.$transaction(
                async (tx) => await this.repository.updateUser(tx, userId, email, displayName),
            );
        } catch (error) {
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }
}
