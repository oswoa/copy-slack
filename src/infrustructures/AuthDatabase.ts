import { PrismaClient } from "@prisma/client";
import { IAuthDatabase } from "./IAuthDatabase";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";
import { UserRecordWithSecrets, UserRecordWithSecretsResponse } from "./IUserDatabase";

export class AuthDatabase implements IAuthDatabase {
    private prisma = new PrismaClient({
        // デフォルトで返さないよう設定
        omit: {
            user: {
                password: true,
                token: true,
            },
        },
    });

    async findByUserIdWithSecrets(userId: string): Promise<UserRecordWithSecretsResponse> {
        try {
            const res = await this.prisma.user.findUnique({
                omit: {
                    token: false,
                    password: false,
                },
                where: {
                    userId,
                },
            });
            if (!res) {
                return {
                    errorDetail: new ErrorDetail(
                        ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
                        ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED,
                        HttpStatusCode.Unauthorized,
                    ),
                };
            }

            const user: UserRecordWithSecrets = {
                userId: res.userId,
                email: res.email,
                displayName: res.displayName,
                token: res.token,
                password: res.password,
            };

            return {
                user,
                errorDetail: ErrorDetail.success(),
            };
        } catch (error) {
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }
}
