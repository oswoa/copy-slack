import { Prisma, PrismaClient } from "@prisma/client";
import {
    IUserDatabase,
    UserRecord,
    UserRecordResponse,
    UserRecordsResponse,
} from "./IUserDatabase";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";
import { UpdateUserApiRequest } from "@/app/api/users/[userId]/route";

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
                omit: {
                    createdAt: true,
                    updatedAt: true,
                },
                where: {
                    displayName: {
                        contains: displayName,
                    },
                },
                include: {
                    profile: true,
                },
            });

            if (0 <= res.length) {
                res.forEach((user) =>
                    users.push({
                        userId: user.userId,
                        email: user.email,
                        displayName: user.displayName,
                        imageUrl: user.displayName,
                    } as UserRecord),
                );
                errorDetail = ErrorDetail.success();
            }

            return { users, errorDetail };
        } catch (error) {
            return {
                users,
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }

    async update(userId: string, email: string, displayName: string): Promise<UserRecordResponse> {
        try {
            const data: Prisma.UserUpdateInput = {
                email,
                displayName,
            };
            const res = await this.prisma.user.update({
                data,
                where: {
                    userId,
                },
                include: {
                    profile: true,
                },
            });

            const user: UserRecord = {
                userId: res.userId,
                email: res.email,
                displayName: res.displayName,
                imageUrl: res.profile?.imageUrl || "",
            };
            return { user, errorDetail: ErrorDetail.success() };
        } catch (error) {
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }
}
