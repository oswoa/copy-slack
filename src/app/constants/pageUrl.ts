export class PageFactory {
    private static readonly PAGE_LOGIN = "/login";
    private static readonly PAGE_SIGNUP = "/signup";
    private static readonly PAGE_WORKSPACE = "/workspace";
    private static readonly PAGE_ERROR = "/error";

    static GetLoginURL(): string {
        return this.PAGE_LOGIN;
    }

    static GetSignupURL(): string {
        return this.PAGE_SIGNUP;
    }

    static GetErrorURL(): string {
        return this.PAGE_ERROR;
    }

    static GetWorkspaceURL(workspaceId: string, channelId: string): string {
        return `${this.PAGE_WORKSPACE}/${workspaceId}/${channelId}`;
    }
}
