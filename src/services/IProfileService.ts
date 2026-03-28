import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ProfileRecord } from "@/infrustructures/IProfileDatabase";

export type ProfileServiceResponse = {
    profile?: ProfileRecord;
    errorDetail: ErrorDetail;
};

export interface IProfileService {
    getProfile(userId: string): Promise<ProfileServiceResponse>;
    createProfile(userId: string, imageUrl: string, file?: File): Promise<ProfileServiceResponse>;
}
