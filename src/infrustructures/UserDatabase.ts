import { PrismaClient } from "@prisma/client";
import { IUserDatabase, UserRecord, UserRecordsResponse } from "./IUserDatabase";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";

export class UserDatabase implements IUserDatabase {
    private prisma = new PrismaClient({
        // デフォルトで返さないよう設定
        omit: {
            user: {
                password: true,
                token: true,
            },
        },
    });

    async findAllByDisplayName(displayName: string): Promise<UserRecordsResponse> {
        let errorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_NOT_FOUND_RECORDS,
            ERROR_MESSAGES.ERROR_SERVER_NOT_FOUND_RECORDS,
            HttpStatusCode.NotFound,
        );
        let users: UserRecord[] = [];

        try {
            const res = await this.prisma.user.findMany({
                select: {
                    userId: true,
                    email: true,
                    displayName: true,
                },
                where: {
                    displayName: {
                        contains: displayName,
                    },
                },
            });

            if (0 <= res.length) {
                users = res;
                errorDetail = ErrorDetail.success();
            }

            return { users, errorDetail };
        } catch (error) {
            return { users, errorDetail: ErrorDetail.getFromPrismaError(error) };
        }
    }
}
