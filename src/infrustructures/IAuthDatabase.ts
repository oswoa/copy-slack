import { ErrorDetail } from "@/app/common/ErrorDetail";

// Userデータ
export type UserRecordWithSecrets = {
    userId: string;
    email: string;
    displayName: string;
    token: string;
    password: string;
};
export type UserRecord = Omit<UserRecordWithSecrets, "token" | "password">;

// Userレスポンス
export type UserRecordWithSecretsResponse = {
    user?: UserRecordWithSecrets;
    errorDetail: ErrorDetail;
};

export interface IAuthDatabase {
    findByUserIdWithSecrets(userId: string): Promise<UserRecordWithSecretsResponse>;
}
