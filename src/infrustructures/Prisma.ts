import { UserWithSecretsResponse, IAuthDatabase, UserDatabaseWithSecrets } from "./IAuthDatabase";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { PrismaClient } from "@prisma/client";

export class PrismaDatabase implements IAuthDatabase {
    private prisma = new PrismaClient({
        // デフォルトで返さないよう設定
        omit: {
            user: {
                password: true,
                token: true,
            },
        },
    });

    async findByUserIdWithSecrets(userId: string): Promise<UserWithSecretsResponse> {
        try {
            const errorDetail: ErrorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
                ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED,
            );

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
                return { errorDetail };
            }

            const user: UserDatabaseWithSecrets = {
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
