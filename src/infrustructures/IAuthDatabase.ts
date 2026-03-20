import { ErrorDetail } from "@/app/common/ErrorDetail";

// Userデータ
export type UserDatabaseWithSecrets = {
    userId: string;
    email: string;
    displayName: string;
    token: string;
    password: string;
};
export type UserDatabase = Omit<UserDatabaseWithSecrets, "token" | "password">;

// Userレスポンス
export type UserWithSecretsResponse = {
    user?: UserDatabaseWithSecrets;
    errorDetail: ErrorDetail;
};

export interface IAuthDatabase {
    findByUserIdWithSecrets(userId: string): Promise<UserWithSecretsResponse>;
}
