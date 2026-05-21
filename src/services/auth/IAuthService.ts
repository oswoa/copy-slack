import { ErrorDetail } from "@/app/common/ErrorDetail";
import { UserRecord, UserRecordWithSecrets } from "@/infrastructures/user/IUserDatabase";

export type AuthServiceResponse = {
    user?: UserRecord;
    workspaceId?: string;
    channelId?: string;
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
    auth(userId: string, slackToken: string): Promise<AuthServiceResponse>;
    login(userId: string, password: string): Promise<LoginServiceResponse>;
    signup(userId: string, email: string, password: string): Promise<SignupServiceResponse>;
}
