import { IProfileService, ProfileServiceResponse } from "./IProfileService";
import { IProfileRepository } from "@/repositories/IProfileRepository";

export class ProfileService implements IProfileService {
    constructor(private repository: IProfileRepository) {}

    async getProfile(userId: string): Promise<ProfileServiceResponse> {
        return await this.repository.getProfile(userId);
    }

    async createProfile(
        userId: string,
        imageUrl: string,
        file?: File,
    ): Promise<ProfileServiceResponse> {
        return await this.repository.createProfile(userId, imageUrl, file);
    }
}
