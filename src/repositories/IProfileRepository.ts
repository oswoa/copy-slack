import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ProfileRecord } from "@/infrustructures/IProfileDatabase";
import { ProfileServiceResponse } from "@/services/IProfileService";

export type ProfileRepositoryResponse = {
    profile?: ProfileRecord;
    errorDetail: ErrorDetail;
};

export interface IProfileRepository {
    getProfile(userId: string): Promise<ProfileRepositoryResponse>;
    updateProfile(
        userId: string,
        uploadPath: string,
        file: File,
    ): Promise<ProfileRepositoryResponse>;
}
