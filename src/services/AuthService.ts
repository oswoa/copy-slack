import { ErrorDetail } from "@/app/common/ErrorDetail";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import {
    AuthServiceResponse,
    IAuthService,
    LoginServiceRequest,
    LoginServiceResponse,
} from "./IAuthService";
import { IAuthRepository } from "@/repositories/IAuthRepository";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { WorkspaceService } from "./WorkspaceService";
import { ChannelService } from "./ChannelService";
import { HttpStatusCode } from "axios";

export class AuthService implements IAuthService {
    constructor(
        private authRepository: IAuthRepository,
        private workspaceService: WorkspaceService,
        private channelService: ChannelService,
    ) {}

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

        return await this.authRepository.auth(userId!.value, token!.value);
    }

    async login(request: LoginServiceRequest): Promise<LoginServiceResponse> {
        const loginResponse = await this.authRepository.login(request.userId, request.password);
        if (!loginResponse.errorDetail.success) {
            return { errorDetail: loginResponse.errorDetail };
        }

        const user = loginResponse.user;
        const workspacesResponse = await this.workspaceService.getWorkspaces(user!.userId);
        if (!workspacesResponse.errorDetail.success) {
            return { errorDetail: workspacesResponse.errorDetail };
        }

        const workspace = workspacesResponse.workspaces![0];
        const channelsResponse = await this.channelService.getChannels(workspace.workspaceId);
        if (!channelsResponse.errorDetail.success) {
            return { errorDetail: channelsResponse.errorDetail };
        }

        const channel = channelsResponse.channels![0];
        const serviceResponse: LoginServiceResponse = {
            user,
            workspaceId: workspace.workspaceId,
            channelId: String(channel.channelId),
            errorDetail: ErrorDetail.success(),
        };

        return serviceResponse;
    }
}
