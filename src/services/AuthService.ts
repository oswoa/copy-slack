import { ErrorDetail } from "@/app/common/ErrorDetail";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
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
import { channelService, profileService, workspaceService } from "@/app/lib/init";

export class AuthService implements IAuthService {
    constructor(private repository: IAuthRepository) {}

    async auth(cookies: RequestCookies): Promise<AuthServiceResponse> {
        const errorDetail: ErrorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
            ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED,
            HttpStatusCode.Unauthorized,
        );

        const hasToken = cookies.has("token");
        const hasUserId = cookies.has("userId");
        if (!hasToken || !hasUserId) {
            return { errorDetail };
        }

        const token = cookies.get("token");
        const userId = cookies.get("userId");
        if (token!.value.length === 0 || userId!.value.length === 0) {
            return { errorDetail };
        }

        return await this.repository.auth(userId!.value, token!.value);
    }

    async login(userId: string, password: string): Promise<LoginServiceResponse> {
        const loginResponse = await this.repository.login(userId, password);
        if (!loginResponse.errorDetail.success) {
            return {
                user: loginResponse.user!,
                errorDetail: loginResponse.errorDetail,
            };
        }

        const user = loginResponse.user;
        const workspacesResponse = await workspaceService.getWorkspaces(user!.userId);
        if (!workspacesResponse.errorDetail.success) {
            return {
                user: loginResponse.user!,
                errorDetail: workspacesResponse.errorDetail,
            };
        }

        const workspace = workspacesResponse.workspaces![0];
        const channelsResponse = await channelService.getChannels(workspace.workspaceId);
        if (!channelsResponse.errorDetail.success) {
            return {
                user: loginResponse.user!,
                errorDetail: channelsResponse.errorDetail,
            };
        }

        const channel = channelsResponse.channels![0];
        const serviceResponse: LoginServiceResponse = {
            user: loginResponse.user!,
            workspaceId: workspace.workspaceId,
            channelId: String(channel.channelId),
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
            `${userId}-ch`,
            workspaceResponse.workspace!.workspaceId,
        );
        if (!channelResponse.errorDetail.success) {
            return {
                errorDetail: channelResponse.errorDetail,
            };
        }

        const profileResponse = await profileService.createProfile(userId, "");
        if (!profileResponse.errorDetail.success) {
            return {
                errorDetail: profileResponse.errorDetail,
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
