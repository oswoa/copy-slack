import { UserRecord, UserRecordWithSecrets, UserRecordWithSecretsResponse } from "./IUserDatabase";
import { ErrorDetail } from "@/app/common/ErrorDetail";

export type SignupDatabaseResponse = {
    user?: UserRecordWithSecrets;
    errorDetail: ErrorDetail;
};

export interface IAuthDatabase {
    findByUserIdWithSecrets(userId: string): Promise<UserRecordWithSecretsResponse>;
    create(userId: string, email: string, password: string): Promise<SignupDatabaseResponse>;
}
