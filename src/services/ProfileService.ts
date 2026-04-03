import { AppPrismaClient } from "@/app/lib/init";
import { IProfileService, ProfileServiceResponse } from "./IProfileService";
import { IProfileRepository } from "@/repositories/IProfileRepository";
import { ErrorDetail } from "@/app/common/ErrorDetail";

export class ProfileService implements IProfileService {
    constructor(
        private prisma: AppPrismaClient,
        private repository: IProfileRepository,
    ) {}

    async getProfile(userId: string): Promise<ProfileServiceResponse> {
        return await this.repository.getProfile(userId);
    }

    async updateProfile(userId: string, file: File): Promise<ProfileServiceResponse> {
        try {
            return this.prisma.$transaction(
                async (tx) => await this.repository.updateProfile(tx, userId, file),
            );
        } catch (error) {
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }
}
