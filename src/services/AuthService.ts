import { ErrorDetail } from "@/app/common/ErrorDetail";
import {
    AuthServiceResponse,
    IAuthService,
    LoginServiceResponse,
    SignupServiceResponse,
} from "./IAuthService";
import { IAuthRepository } from "@/repositories/IAuthRepository";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";
import { IWorkspaceRepository } from "@/repositories/IWorkspaceRepository";
import { IChannelRepository } from "@/repositories/IChannelRepository";
import { AppPrismaClient } from "@/app/lib/init";

export class AuthService implements IAuthService {
    constructor(
        private prisma: AppPrismaClient,
        private authRepository: IAuthRepository,
        private workspaceRepository: IWorkspaceRepository,
        private channelRepository: IChannelRepository,
    ) {}

    async auth(userId: string, token: string): Promise<AuthServiceResponse> {
        const authResponse = await this.authRepository.auth(userId);
        if (!authResponse.errorDetail.success) {
            return {
                errorDetail: authResponse.errorDetail,
            };
        }
        if (token !== authResponse.user?.token) {
            const errorDetail: ErrorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
                ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED,
                HttpStatusCode.Unauthorized,
            );
            return { errorDetail };
        }

        const workspacesResponse = await this.workspaceRepository.getWorkspaces(userId);
        if (!workspacesResponse.errorDetail.success) {
            return {
                errorDetail: workspacesResponse.errorDetail,
            };
        }

        const workspace = workspacesResponse.workspaces![0];
        const channelsResponse = await this.channelRepository.getChannels(workspace.workspaceId);
        if (!channelsResponse.errorDetail.success) {
            return {
                errorDetail: channelsResponse.errorDetail,
            };
        }

        const channel = channelsResponse.channels![0];
        const serviceResponse: AuthServiceResponse = {
            user: {
                userId: authResponse.user!.userId,
                email: authResponse.user!.email,
                displayName: authResponse.user!.displayName,
                imageUrl: authResponse.user!.imageUrl,
            },
            workspaceId: workspace.workspaceId,
            channelId: channel.channelId,
            errorDetail: ErrorDetail.success(),
        };

        return serviceResponse;
    }

    async login(userId: string, password: string): Promise<LoginServiceResponse> {
        const loginResponse = await this.authRepository.login(userId, password);
        if (!loginResponse.errorDetail.success) {
            return {
                errorDetail: loginResponse.errorDetail,
            };
        }

        const workspacesResponse = await this.workspaceRepository.getWorkspaces(userId);
        if (!workspacesResponse.errorDetail.success) {
            return {
                errorDetail: workspacesResponse.errorDetail,
            };
        }

        const workspace = workspacesResponse.workspaces![0];
        const channelsResponse = await this.channelRepository.getChannels(workspace.workspaceId);
        if (!channelsResponse.errorDetail.success) {
            return {
                errorDetail: channelsResponse.errorDetail,
            };
        }

        const channel = channelsResponse.channels?.find(
            (channel) => channel.channelName === "general",
        );
        const serviceResponse: LoginServiceResponse = {
            user: loginResponse.user!,
            workspaceId: workspace.workspaceId,
            channelId: channel!.channelId,
            errorDetail: ErrorDetail.success(),
        };

        return serviceResponse;
    }

    async signup(userId: string, email: string, password: string): Promise<SignupServiceResponse> {
        try {
            return this.prisma.$transaction(async (tx) => {
                const authResponse = await this.authRepository.signup(tx, userId, email, password);
                if (!authResponse.errorDetail.success) {
                    return {
                        errorDetail: authResponse.errorDetail,
                    };
                }

                const workspaceResponse = await this.workspaceRepository.createWorkspace(
                    tx,
                    userId,
                );
                if (!workspaceResponse.errorDetail.success) {
                    return {
                        errorDetail: workspaceResponse.errorDetail,
                    };
                }

                return {
                    user: authResponse.user,
                    workspaceId: workspaceResponse.workspace?.workspaceId,
                    channelId: workspaceResponse.workspace?.channelId,
                    errorDetail: authResponse.errorDetail,
                };
            });
        } catch (error) {
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }
}
