import { ErrorDetail } from "@/app/common/ErrorDetail";
import { UserDatabase, UserDatabaseWithSecrets } from "@/infrustructures/IAuthDatabase";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";

export type AuthServiceResponse = {
    user?: UserDatabase;
    errorDetail: ErrorDetail;
};

export type LoginServiceRequest = {
    userId: string;
    password: string;
};
export type LoginServiceResponse = {
    user?: UserDatabaseWithSecrets;
    errorDetail?: ErrorDetail;
};

export interface IAuthService {
    auth(cookies: RequestCookies): Promise<AuthServiceResponse>;
    login(request: LoginServiceRequest): Promise<LoginServiceResponse>;
}
