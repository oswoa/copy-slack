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
import { channelService, workspaceService } from "@/app/lib/init";

export class AuthService implements IAuthService {
    constructor(private repository: IAuthRepository) {}

    async auth(userId: string, token: string): Promise<AuthServiceResponse> {
        const authResponse = await this.repository.auth(userId, token);
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

        const workspacesResponse = await workspaceService.getWorkspaces(authResponse.user!.userId);
        if (!workspacesResponse.errorDetail.success) {
            return {
                errorDetail: workspacesResponse.errorDetail,
            };
        }

        const workspace = workspacesResponse.workspaces![0];
        const channelsResponse = await channelService.getChannels(workspace.workspaceId);
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
        const loginResponse = await this.repository.login(userId, password);
        if (!loginResponse.errorDetail.success) {
            return {
                errorDetail: loginResponse.errorDetail,
            };
        }

        const workspacesResponse = await workspaceService.getWorkspaces(loginResponse.user!.userId);
        if (!workspacesResponse.errorDetail.success) {
            return {
                errorDetail: workspacesResponse.errorDetail,
            };
        }

        const workspace = workspacesResponse.workspaces![0];
        const channelsResponse = await channelService.getChannels(workspace.workspaceId);
        if (!channelsResponse.errorDetail.success) {
            return {
                errorDetail: channelsResponse.errorDetail,
            };
        }

        const channel = channelsResponse.channels![0];
        const serviceResponse: LoginServiceResponse = {
            user: loginResponse.user!,
            workspaceId: workspace.workspaceId,
            channelId: channel.channelId,
            errorDetail: ErrorDetail.success(),
        };

        return serviceResponse;
    }

    async signup(userId: string, email: string, password: string): Promise<SignupServiceResponse> {
        const authResponse = await this.repository.signup(userId, email, password);
        if (!authResponse.errorDetail.success) {
            return {
                errorDetail: authResponse.errorDetail,
            };
        }

        const workspaceResponse = await workspaceService.createWorkspace(
            userId,
            `${userId}-workspace`,
        );
        if (!workspaceResponse.errorDetail.success) {
            return {
                errorDetail: workspaceResponse.errorDetail,
            };
        }

        const channelResponse = await channelService.createChannel(
            workspaceResponse.workspace!.workspaceId,
        );
        if (!channelResponse.errorDetail.success) {
            return {
                errorDetail: channelResponse.errorDetail,
            };
        }

        return {
            user: authResponse.user,
            workspaceId: workspaceResponse.workspace?.workspaceId,
            channelId: channelResponse.channel?.channelId,
            errorDetail: authResponse.errorDetail,
        };
    }
}
