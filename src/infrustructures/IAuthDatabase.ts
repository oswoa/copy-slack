import { UserRecordWithSecretsResponse } from "./IUserDatabase";

export interface IAuthDatabase {
    findByUserIdWithSecrets(userId: string): Promise<UserRecordWithSecretsResponse>;
}
