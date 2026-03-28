import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ProfileRecord } from "@/infrustructures/IProfileDatabase";
import { UserRecord, UserRecordWithSecrets } from "@/infrustructures/IUserDatabase";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";

export type AuthServiceResponse = {
    user?: UserRecord;
    errorDetail: ErrorDetail;
};

export type LoginServiceResponse = {
    user?: UserRecordWithSecrets;
    workspaceId?: string;
    channelId?: string;
    errorDetail: ErrorDetail;
};

export type SignupServiceResponse = {
    user?: UserRecordWithSecrets;
    workspaceId?: string;
    channelId?: string;
    errorDetail: ErrorDetail;
};

export interface IAuthService {
    auth(cookies: RequestCookies): Promise<AuthServiceResponse>;
    login(userId: string, password: string): Promise<LoginServiceResponse>;
    signup(userId: string, email: string, password: string): Promise<SignupServiceResponse>;
}
