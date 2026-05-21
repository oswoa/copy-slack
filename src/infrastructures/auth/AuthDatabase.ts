import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { uuidv7 } from "uuidv7";
import { IAuthDatabase, SignupDatabaseResponse } from "./IAuthDatabase";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";
import { UserRecordWithSecrets, UserRecordWithSecretsResponse } from "../user/IUserDatabase";
import { SALT } from "@/app/constants/crypt";
import { prisma as defaultPrisma, TransactionClient } from "@/app/lib/init";

export class AuthDatabase implements IAuthDatabase {
    constructor(private readonly prisma = defaultPrisma) {}

    async findByUserIdWithSecrets(userId: string): Promise<UserRecordWithSecretsResponse> {
        try {
            const res = await this.prisma.user.findUnique({
                omit: {
                    slackToken: false,
                    password: false,
                },
                where: {
                    userId,
                },
                include: {
                    profile: {
                        where: {
                            userId,
                        },
                    },
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
                slackToken: res.slackToken,
                password: res.password,
                imageUrl: res.profile?.imageUrl || "",
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

    async create(
        tx: TransactionClient,
        userId: string,
        email: string,
        password: string,
    ): Promise<SignupDatabaseResponse> {
        try {
            const slackToken = uuidv7();
            const data: Prisma.UserCreateInput = {
                userId,
                email,
                displayName: userId,
                password: await bcrypt.hash(password, SALT),
                slackToken,
                profile: {
                    create: {
                        imageUrl: "",
                    },
                },
            };
            const res = await tx.user.create({
                data,
                select: {
                    userId: true,
                    email: true,
                    displayName: true,
                    password: true,
                    slackToken: true,
                    profile: {
                        select: {
                            imageUrl: true,
                        },
                    },
                },
            });
            return {
                user: {
                    userId: res.userId,
                    email: res.email,
                    displayName: res.displayName,
                    password: res.password,
                    slackToken: res.slackToken,
                    imageUrl: res.profile?.imageUrl || "",
                },
                errorDetail: ErrorDetail.success(),
            };
        } catch (error) {
            throw error;
        }
    }
}
