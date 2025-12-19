import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import LoginComponent from "@/app/(public)/login/page";
import { CurrentUserProvider } from "@/app/context/CurrentUserContext";
import { ToastProvider } from "@/app/context/ToastContext";
import { mockGetChannelListApi, mockGetWorkspaceListApi, mockLoginApi } from "@/tests/handlers";
import { mockReplace } from "../../../../vitest.setup";
import { HttpStatusCode } from "axios";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { server } from "@/tests/node";
import { http, HttpResponse } from "msw";

describe("LoginComponent", () => {
    const DisplayPage = () => (
        <CurrentUserProvider>
            <ToastProvider>
                <LoginComponent />
            </ToastProvider>
        </CurrentUserProvider>
    );

    describe("正常系", () => {
        describe("初期表示", () => {
            it("タイトルが「Copy Slack」であること", async () => {
                // Arrange
                render(<DisplayPage />);

                // Act
                const title = screen.getByRole("heading", { level: 1 });

                // Assert
                expect(title).toHaveTextContent("Copy Slack");
            });

            it("「ユーザID」入力テキストボックスが存在すること", async () => {
                // Arrange
                render(<DisplayPage />);

                // Act
                const input = screen.getByLabelText("ユーザID *");

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

            it("「ログイン」ボタンが存在すること", async () => {
                // Arrange
                render(<DisplayPage />);

                // Act
                const loginButton = screen.getByRole("button", { name: "ログイン" });

                // Assert
                expect(loginButton).toBeInTheDocument();
                expect(loginButton).toBeDisabled();
            });

            it("ユーザ登録ページへのリンクが設定されていること", async () => {
                // Arrange
                render(<DisplayPage />);

                // Act
                const link = screen.getByRole("link", { name: "こちら" });

                // Assert
                expect(link).toBeInTheDocument();
                expect(link).toHaveAttribute("href", "/signup");
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

        it("ユーザID, パスワードでバリデーションエラーが発生しないとき、「ログイン」ボタンが有効であること", async () => {
            // Arrange
            render(<DisplayPage />);
            const user = userEvent.setup();

            // Act
            const userId = screen.getByLabelText("ユーザID *");
            const password = screen.getByLabelText("パスワード *");
            await user.type(userId, "a".repeat(3));
            await user.type(password, "a".repeat(8));
            await user.tab();

            // Assert
            const loginButton = screen.getByRole("button", { name: "ログイン" });
            expect(loginButton).toBeInTheDocument();
            expect(loginButton).toBeEnabled();
        });
    });

    describe("ボタン制御", () => {
        it("「ログイン」ボタン押下で指定したAPIが動くこと", async () => {
            // Arrange
            render(<DisplayPage />);
            const user = userEvent.setup();
            const userId = "user1";
            const password = "password";
            const ownerId = userId;
            const workspaceId = "1";

            // Act
            const inputUserId = screen.getByLabelText("ユーザID *");
            const inputPassword = screen.getByLabelText("パスワード *");
            await user.type(inputUserId, userId);
            await user.type(inputPassword, password);
            await user.tab();

            const loginButton = screen.getByRole("button", { name: "ログイン" });
            await user.click(loginButton);

            // Assert
            // ログインAPI
            expect(mockLoginApi).toHaveBeenCalledTimes(1);
            expect(mockLoginApi).toHaveBeenCalledWith({
                userId,
                password,
            });

            // ワークスペース一覧取得API
            expect(mockGetWorkspaceListApi).toHaveBeenCalledTimes(1);
            expect(mockGetWorkspaceListApi).toHaveBeenCalledWith({
                ownerId,
            });

            // チャネル一覧取得API
            expect(mockGetChannelListApi).toHaveBeenCalledTimes(1);
            expect(mockGetChannelListApi).toHaveBeenCalledWith({
                workspaceId,
            });
        });

        it("「ログイン」ボタン押下でワークスペースへ遷移すること", async () => {
            // Arrange
            render(<DisplayPage />);
            const user = userEvent.setup();
            const userId = "user1";
            const password = "password";

            // Act
            const inputUserId = screen.getByLabelText("ユーザID *");
            const inputPassword = screen.getByLabelText("パスワード *");
            await user.type(inputUserId, userId);
            await user.type(inputPassword, password);
            await user.tab();

            const loginButton = screen.getByRole("button", { name: "ログイン" });
            await user.click(loginButton);

            // Assert
            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledTimes(1);
                expect(mockReplace).toHaveBeenCalledWith("/workspace/1/1");
            });
        });
    });

    // MUIのLinkコンポーネントを利用してるため、初期表示でリンクが表示されていることを確認すれば問題なし
    // describe("リンク制御", () => {
    // it("リンク「こちら」からユーザ登録ページへ遷移すること", async () => {});
    // });

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

                it("ユーザIDに3文字未満の入力で「ログイン」ボタンが無効化されていること", async () => {
                    // Arrange
                    render(<DisplayPage />);
                    const user = userEvent.setup();

                    // Act
                    const input = screen.getByLabelText("ユーザID *");
                    await user.type(input, "a".repeat(2));
                    await user.tab();

                    // Assert
                    const loginButton = screen.getByRole("button", { name: "ログイン" });
                    expect(loginButton).toBeDisabled();
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

                it("パスワードに8文字未満の入力で「ログイン」ボタンが無効化されていること", async () => {
                    // Arrange
                    render(<DisplayPage />);
                    const user = userEvent.setup();

                    // Act
                    const input = screen.getByLabelText("パスワード *");
                    await user.type(input, "a".repeat(7));
                    await user.tab();

                    // Assert
                    const loginButton = screen.getByRole("button", { name: "ログイン" });
                    expect(loginButton).toBeDisabled();
                });
            });

            it("ユーザID、パスワードでバリデーションエラーが発生している時、「ログイン」ボタンが無効化されていること", async () => {
                // Arrange
                render(<DisplayPage />);
                const user = userEvent.setup();

                // Act
                const userId = screen.getByLabelText("ユーザID *");
                const password = screen.getByLabelText("パスワード *");
                await user.type(userId, "a".repeat(2));
                await user.type(password, "a".repeat(7));
                await user.tab();

                // Assert
                const loginButton = screen.getByRole("button", { name: "ログイン" });
                expect(loginButton).toBeDisabled();
            });
        });

        describe("ボタン制御", () => {
            it("「ログイン」ボタン押下時にログイン処理が失敗するとエラーメッセージが表示されること", async () => {
                // Arrange
                const status = HttpStatusCode.InternalServerError;
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_SERVER_UNKNOWN,
                    ERROR_MESSAGES.ERROR_SERVER_UNKNOWN
                );
                server.use(
                    http.post("/api/login", async () => {
                        return HttpResponse.json({ errorDetail }, { status });
                    })
                );
                render(<DisplayPage />);
                const user = userEvent.setup();
                const userId = "user1";
                const password = "password";

                // Act
                const inputUserId = screen.getByLabelText("ユーザID *");
                const inputPassword = screen.getByLabelText("パスワード *");
                await user.type(inputUserId, userId);
                await user.type(inputPassword, password);
                await user.tab();

                const loginButton = screen.getByRole("button", { name: "ログイン" });
                await user.click(loginButton);

                // Assert
                const errMsg = await screen.findByText(errorDetail.errMsg);
                expect(errMsg).toBeInTheDocument();
            });
        });
    });
});
