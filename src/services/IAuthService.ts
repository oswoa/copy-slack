import { ErrorDetail } from "@/app/common/ErrorDetail";
import { UserRecord, UserRecordWithSecrets } from "@/infrustructures/IAuthDatabase";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";

export type AuthServiceResponse = {
    user?: UserRecord;
    errorDetail: ErrorDetail;
};

export type LoginServiceRequest = {
    userId: string;
    password: string;
};
export type LoginServiceResponse = {
    user?: UserRecordWithSecrets;
    workspaceId?: string;
    channelId?: string;
    errorDetail: ErrorDetail;
};

export interface IAuthService {
    auth(cookies: RequestCookies): Promise<AuthServiceResponse>;
    login(request: LoginServiceRequest): Promise<LoginServiceResponse>;
}
