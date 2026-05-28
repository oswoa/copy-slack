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
import { prisma as defaultPrisma, TransactionClient } from "@/app/lib/init";
import { Prisma } from "@prisma/client";

export class UserDatabase implements IUserDatabase {
    constructor(private readonly prisma = defaultPrisma) {}

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

    async update(
        tx: TransactionClient,
        userId: string,
        email: string,
        displayName: string,
    ): Promise<UserRecordResponse> {
        try {
            const data: Prisma.UserUpdateInput = {
                email,
                displayName,
            };
            const res = await tx.user.update({
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
            throw error;
        }
    }
}
