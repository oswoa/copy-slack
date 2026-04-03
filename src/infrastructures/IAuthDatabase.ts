import { TransactionClient } from "@/app/lib/init";
import { UserRecord, UserRecordWithSecrets, UserRecordWithSecretsResponse } from "./IUserDatabase";
import { ErrorDetail } from "@/app/common/ErrorDetail";

export type SignupDatabaseResponse = {
    user?: UserRecordWithSecrets;
    errorDetail: ErrorDetail;
};

export interface IAuthDatabase {
    findByUserIdWithSecrets(userId: string): Promise<UserRecordWithSecretsResponse>;
    create(
        tx: TransactionClient,
        userId: string,
        email: string,
        password: string,
    ): Promise<SignupDatabaseResponse>;
}
