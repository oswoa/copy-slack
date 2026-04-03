import { ErrorDetail } from "@/app/common/ErrorDetail";
import { TransactionClient } from "@/app/lib/init";
import { UserRecordRepositoryResponse } from "@/repositories/IUserRepository";

// Userデータ
export type UserRecordWithSecrets = {
    userId: string;
    email: string;
    displayName: string;
    password: string;
    token: string;
    imageUrl: string;
};
export type UserRecord = Omit<UserRecordWithSecrets, "token" | "password">;

// Userレスポンス
export type UserRecordResponse = {
    user?: UserRecord;
    errorDetail: ErrorDetail;
};

export type UserRecordsResponse = {
    users: UserRecord[];
    errorDetail: ErrorDetail;
};

export type UserRecordWithSecretsResponse = {
    user?: UserRecordWithSecrets;
    errorDetail: ErrorDetail;
};

export interface IUserDatabase {
    findAllByDisplayName(displayName: string): Promise<UserRecordsResponse>;
    update(
        tx: TransactionClient,
        userId: string,
        email: string,
        displayName: string,
    ): Promise<UserRecordResponse>;
}
