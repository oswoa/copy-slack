import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ProfileRecord } from "@/infrastructures/IProfileDatabase";

export type ProfileRepositoryResponse = {
    profile?: ProfileRecord;
    errorDetail: ErrorDetail;
};

export interface IProfileRepository {
    getProfile(userId: string): Promise<ProfileRepositoryResponse>;
    updateProfile(userId: string, file: File): Promise<ProfileRepositoryResponse>;
}
