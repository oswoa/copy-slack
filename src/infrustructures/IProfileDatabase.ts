import { ErrorDetail } from "@/app/common/ErrorDetail";

export type ProfileRecord = {
    profileId: string;
    userId: string;
    imageUrl: string;
};

export type ProfileDatabaseResponse = {
    profile?: ProfileRecord;
    errorDetail: ErrorDetail;
};

export interface IProfileDatabase {
    findByUserId(userId: string): Promise<ProfileDatabaseResponse>;
    update(userId: string, uploadPath: string, file: File): Promise<ProfileDatabaseResponse>;
}
