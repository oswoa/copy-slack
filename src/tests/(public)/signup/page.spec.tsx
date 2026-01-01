import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import SignupComponent from "@/app/(public)/signup/page";
import { ToastProvider } from "@/app/context/ToastContext";
import {
    mockRegisterChannelApi,
    mockRegisterProfileApi,
    mockRegisterUserApi,
    mockRegisterWorkspaceApi,
    mockRegisterWorkspaceUserApi,
} from "@/tests/handlers";
import { mockReplace } from "../../../../vitest.setup";
import { HttpStatusCode } from "axios";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { server } from "@/tests/node";
import { http, HttpResponse } from "msw";

describe("SignupComponent", () => {
    const DisplayPage = () => (
        <ToastProvider>
            <SignupComponent />
        </ToastProvider>
    );

    describe("正常系", () => {
        describe("初期表示", () => {
            it("タイトルが「ユーザ登録」であること", async () => {
                // Arrange
                render(<DisplayPage />);

                // Act
                const title = screen.getByRole("heading", { level: 1 });

                // Assert
                expect(title).toHaveTextContent("ユーザ登録");
            });

            it("「ユーザID」入力テキストボックスが存在すること", async () => {
                // Arrange
                render(<DisplayPage />);

                // Act
                const input = screen.getByLabelText("ユーザID *");

                // Assert
                expect(input).toBeInTheDocument();
            });

            it("「メールアドレス」入力テキストボックスが存在すること", async () => {
                // Arrange
                render(<DisplayPage />);

                // Act
                const input = screen.getByLabelText("メールアドレス *");

                // Assert
                expect(input).toBeInTheDocument();
            });

            it("「パスワード」入力テキストボックスが存在すること", async () => {
                // Arrange
                render(<DisplayPage />);

                // Act
                const input = screen.getByLabelText("パスワード *");

                // Assert
                expect(input).toBeInTheDocument();
            });

            it("「登録」ボタンが存在すること", async () => {
                // Arrange
                render(<DisplayPage />);

                // Act
                const registerButton = screen.getByRole("button", { name: "登録" });

                // Assert
                expect(registerButton).toBeInTheDocument();
                expect(registerButton).toBeDisabled();
            });
        });
    });

    describe("バリデーション", () => {
        it("ユーザIDに3文字以上の入力でバリデーションエラーが発生しないこと", async () => {
            // Arrange
            render(<DisplayPage />);
            const user = userEvent.setup();

            // Act
            const input = screen.getByLabelText("ユーザID *");
            await user.type(input, "a".repeat(3));
            await user.tab();

            // Assert
            const validationErrMsg = screen.queryByText("ユーザIDは3文字以上で入力してください");
            expect(validationErrMsg).not.toBeInTheDocument();
        });

        it("メールアドレスに正しい形式の入力でバリデーションエラーが発生しないこと", async () => {
            // Arrange
            render(<DisplayPage />);
            const user = userEvent.setup();

            // Act
            const input = screen.getByLabelText("メールアドレス *");
            await user.type(input, "test@example.com");
            await user.tab();

            // Assert
            const validationErrMsg = screen.queryByText("不正なメールアドレスです");
            expect(validationErrMsg).not.toBeInTheDocument();
        });

        it("パスワードに8文字以上の入力でバリデーションエラーが発生しないこと", async () => {
            // Arrange
            render(<DisplayPage />);
            const user = userEvent.setup();

            // Act
            const input = screen.getByLabelText("パスワード *");
            await user.type(input, "a".repeat(8));
            await user.tab();

            // Assert
            const validationErrMsg = screen.queryByText("パスワードは8文字以上で入力してください");
            expect(validationErrMsg).not.toBeInTheDocument();
        });

        it("ユーザID, メールアドレス、パスワードでバリデーションエラーが発生しないとき、「登録」ボタンが有効であること", async () => {
            // Arrange
            render(<DisplayPage />);
            const user = userEvent.setup();

            // Act
            const userId = screen.getByLabelText("ユーザID *");
            const email = screen.getByLabelText("メールアドレス *");
            const password = screen.getByLabelText("パスワード *");
            await user.type(userId, "a".repeat(3));
            await user.type(email, "test@example.com");
            await user.type(password, "a".repeat(8));
            await user.tab();

            // Assert
            const loginButton = screen.getByRole("button", { name: "登録" });
            expect(loginButton).toBeInTheDocument();
            expect(loginButton).toBeEnabled();
        });
    });

    describe("ボタン制御", () => {
        it("「登録」ボタン押下で指定したAPIが動くこと", async () => {
            // Arrange
            render(<DisplayPage />);
            const user = userEvent.setup();
            const userId = "user1";
            const email = "user1@example.com";
            const password = "password";
            const ownerId = userId;
            const workspaceId = "auto";
            const workspaceName = undefined;
            const channelName = undefined;

            // Act
            const inputUserId = screen.getByLabelText("ユーザID *");
            const inputEmail = screen.getByLabelText("メールアドレス *");
            const inputPassword = screen.getByLabelText("パスワード *");
            await user.type(inputUserId, userId);
            await user.type(inputEmail, email);
            await user.type(inputPassword, password);
            await user.tab();

            const registerButton = screen.getByRole("button", { name: "登録" });
            await user.click(registerButton);

            // Assert
            // ユーザ登録API
            expect(mockRegisterUserApi).toHaveBeenCalledTimes(1);
            expect(mockRegisterUserApi).toHaveBeenCalledWith({
                userId,
                email,
                password,
            });

            // ワークスペース登録API
            expect(mockRegisterWorkspaceApi).toHaveBeenCalledTimes(1);
            expect(mockRegisterWorkspaceApi).toHaveBeenCalledWith({
                workspaceId,
                ownerId,
                workspaceName,
            });

            // ワークスペースユーザ登録API
            expect(mockRegisterWorkspaceUserApi).toHaveBeenCalledTimes(1);
            expect(mockRegisterWorkspaceUserApi).toHaveBeenCalledWith({
                workspaceId,
                userId,
            });

            // チャネル一覧取得API
            expect(mockRegisterChannelApi).toHaveBeenCalledTimes(1);
            expect(mockRegisterChannelApi).toHaveBeenCalledWith({
                workspaceId,
                channelName,
            });

            // ユーザプロフィール登録API
            expect(mockRegisterProfileApi).toHaveBeenCalledTimes(1);
            expect(mockRegisterProfileApi).toHaveBeenCalledWith({
                userId,
            });
        });

        it("「登録」ボタン押下でワークスペースへ遷移すること", async () => {
            // Arrange
            render(<DisplayPage />);
            const user = userEvent.setup();
            const userId = "user1";
            const email = "user1@example.com";
            const password = "password";
            const workspaceId = "auto";
            const channelId = 1;

            // Act
            const inputUserId = screen.getByLabelText("ユーザID *");
            const inputEmail = screen.getByLabelText("メールアドレス *");
            const inputPassword = screen.getByLabelText("パスワード *");
            await user.type(inputUserId, userId);
            await user.type(inputEmail, email);
            await user.type(inputPassword, password);
            await user.tab();

            const registerButton = screen.getByRole("button", { name: "登録" });
            await user.click(registerButton);

            // Assert
            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledTimes(1);
                expect(mockReplace).toHaveBeenCalledWith(`/workspace/${workspaceId}/${channelId}`);
            });
        });
    });

    describe("異常系", () => {
        describe("バリデーション", () => {
            describe("ユーザID", () => {
                it("ユーザIDに3文字未満の入力でバリデーションエラーが発生すること", async () => {
                    // Arrange
                    render(<DisplayPage />);
                    const user = userEvent.setup();

                    // Act
                    const input = screen.getByLabelText("ユーザID *");
                    await user.type(input, "a".repeat(2));
                    await user.tab();

                    // Assert
                    const validationErrMsg =
                        screen.queryByText("ユーザIDは3文字以上で入力してください");
                    expect(validationErrMsg).toBeInTheDocument();
                });

                it("ユーザIDに3文字未満の入力で「登録」ボタンが無効化されていること", async () => {
                    // Arrange
                    render(<DisplayPage />);
                    const user = userEvent.setup();

                    // Act
                    const input = screen.getByLabelText("ユーザID *");
                    await user.type(input, "a".repeat(2));
                    await user.tab();

                    // Assert
                    const registerButton = screen.getByRole("button", { name: "登録" });
                    expect(registerButton).toBeDisabled();
                });
            });

            describe("メールアドレス", () => {
                it("メールアドレスに不正な形式の入力でバリデーションエラーが発生すること", async () => {
                    // Arrange
                    render(<DisplayPage />);
                    const user = userEvent.setup();

                    // Act
                    const input = screen.getByLabelText("メールアドレス *");
                    await user.type(input, "test@example");
                    await user.tab();

                    // Assert
                    const validationErrMsg = screen.queryByText("不正なメールアドレスです");
                    expect(validationErrMsg).toBeInTheDocument();
                });

                it("メールアドレスに不正な形式の入力で「登録」ボタンが無効化されていること", async () => {
                    // Arrange
                    render(<DisplayPage />);
                    const user = userEvent.setup();

                    // Act
                    const input = screen.getByLabelText("ユーザID *");
                    await user.type(input, "test@example");
                    await user.tab();

                    // Assert
                    const registerButton = screen.getByRole("button", { name: "登録" });
                    expect(registerButton).toBeDisabled();
                });
            });

            describe("パスワード", () => {
                it("パスワードに8文字未満の入力でバリデーションエラーが発生すること", async () => {
                    // Arrange
                    render(<DisplayPage />);
                    const user = userEvent.setup();

                    // Act
                    const input = screen.getByLabelText("パスワード *");
                    await user.type(input, "a".repeat(7));
                    await user.tab();

                    // Assert
                    const validationErrMsg =
                        screen.queryByText("パスワードは8文字以上で入力してください");
                    expect(validationErrMsg).toBeInTheDocument();
                });

                it("パスワードに8文字未満の入力で「登録」ボタンが無効化されていること", async () => {
                    // Arrange
                    render(<DisplayPage />);
                    const user = userEvent.setup();

                    // Act
                    const input = screen.getByLabelText("パスワード *");
                    await user.type(input, "a".repeat(7));
                    await user.tab();

                    // Assert
                    const registerButton = screen.getByRole("button", { name: "登録" });
                    expect(registerButton).toBeDisabled();
                });
            });

            it("ユーザID、メールアドレス、パスワードでバリデーションエラーが発生している時、「登録」ボタンが無効化されていること", async () => {
                // Arrange
                render(<DisplayPage />);
                const user = userEvent.setup();

                // Act
                const userId = screen.getByLabelText("ユーザID *");
                const email = screen.getByLabelText("メールアドレス *");
                const password = screen.getByLabelText("パスワード *");
                await user.type(userId, "a".repeat(2));
                await user.type(email, "test@example");
                await user.type(password, "a".repeat(7));
                await user.tab();

                // Assert
                const registerButton = screen.getByRole("button", { name: "登録" });
                expect(registerButton).toBeDisabled();
            });
        });

        describe("ボタン制御", () => {
            it("「登録」ボタン押下時に登録処理が失敗するとエラーメッセージが表示されること", async () => {
                // Arrange
                const status = HttpStatusCode.InternalServerError;
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_SERVER_UNKNOWN,
                    ERROR_MESSAGES.ERROR_SERVER_UNKNOWN
                );
                server.use(
                    http.post("/api/users", async () => {
                        return HttpResponse.json({ errorDetail }, { status });
                    })
                );
                render(<DisplayPage />);
                const user = userEvent.setup();
                const userId = "user1";
                const email = "user1@example.com";
                const password = "password";

                // Act
                const inputUserId = screen.getByLabelText("ユーザID *");
                const inputEmail = screen.getByLabelText("メールアドレス *");
                const inputPassword = screen.getByLabelText("パスワード *");
                await user.type(inputUserId, userId);
                await user.type(inputEmail, email);
                await user.type(inputPassword, password);
                await user.tab();

                const registerButton = screen.getByRole("button", { name: "登録" });
                await user.click(registerButton);

                // Assert
                const errMsg = await screen.findByText(errorDetail.errMsg);
                expect(errMsg).toBeInTheDocument();
            });
        });
    });
});
