import { IProfileService, ProfileServiceResponse } from "./IProfileService";
import { IProfileRepository } from "@/repositories/IProfileRepository";

export class ProfileService implements IProfileService {
    constructor(private repository: IProfileRepository) {}

    async getProfile(userId: string): Promise<ProfileServiceResponse> {
        return await this.repository.getProfile(userId);
    }

    async updateProfile(
        userId: string,
        uploadPath: string,
        file: File,
    ): Promise<ProfileServiceResponse> {
        return await this.repository.updateProfile(userId, uploadPath, file);
    }
}
