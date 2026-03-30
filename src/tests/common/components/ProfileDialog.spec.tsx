import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import ProfileDialog from "@/app/common/components/ProfileDialog";
import { ToastProvider } from "@/app/context/ToastContext";
import { mockLogoutApi, mockUpdateUserApi, mockUpdateUserProfileApi } from "@/tests/handlers";
import { mockReplace } from "../../../../vitest.setup";
import { server } from "@/tests/node";
import { http, HttpResponse } from "msw";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { HttpStatusCode } from "axios";
import { User } from "@/model/User";

type DisplayDialogProps = {
    url?: string;
};

describe("ProfileDialog", () => {
    const userId = "user1";
    const email = "test1@example.com";
    const displayName = "ユーザ1";

    const DisplayDialog = ({ url = "" }: DisplayDialogProps) => {
        const [open, setOpen] = useState(false);
        const [user, setUser] = useState<User>(new User(userId, email, displayName, url));
        const [imageUrl, setImageUrl] = useState(url);

        return (
            <ToastProvider>
                <button onClick={() => setOpen(true)}>open</button>
                {open ? (
                    <ProfileDialog
                        open={open}
                        user={user}
                        updateUser={setUser}
                        imageUrl={imageUrl}
                        setImageUrl={setImageUrl}
                        onClose={() => setOpen(false)}
                    />
                ) : null}
            </ToastProvider>
        );
    };

    describe("正常系", () => {
        describe("初期表示", () => {
            it("タイトルが「ユーザプロフィール更新」であること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);
                const dialog = await screen.findByRole("dialog");

                // Assert
                expect(dialog).toHaveTextContent("ユーザプロフィール更新");
            });

            it("プロフィール画像を設定してない場合、imgタグが存在しないこと", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);
                const img = screen.queryByRole("img");

                // Assert
                expect(img).not.toBeInTheDocument();
            });

            it("プロフィール画像を設定している場合、imgタグが存在すること", async () => {
                // Arrange
                render(<DisplayDialog url="test.png" />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);
                const img = screen.queryByRole("img");

                // Assert
                expect(img).toBeInTheDocument();
            });

            it("注意書き「※ 画像押下でプロフィール画像を更新」が存在すること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);
                const note = await screen.findByText("※ 画像押下でプロフィール画像を更新");

                // Assert
                expect(note).toBeInTheDocument();
            });

            it("「表示名」が存在すること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);
                const label = await screen.findByText(/表示名/);
                const input = screen.getByDisplayValue(displayName);

                // Assert
                expect(label).toBeInTheDocument();
                expect(input).toBeInTheDocument();
            });

            it("「Email」が存在すること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);
                const label = await screen.findByText(/Email/);
                const input = await screen.findByDisplayValue(email);

                // Assert
                expect(label).toBeInTheDocument();
                expect(input).toBeInTheDocument();
            });

            it("「ログアウト」ボタンが存在すること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);
                const logoutButton = await screen.findByRole("button", { name: "ログアウト" });

                // Assert
                expect(logoutButton).toBeInTheDocument();
                expect(logoutButton).toBeEnabled();
            });

            it("「キャンセル」ボタンが存在すること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);
                const cancelButton = await screen.findByRole("button", { name: "キャンセル" });

                // Assert
                expect(cancelButton).toBeInTheDocument();
                expect(cancelButton).toBeEnabled();
            });

            it("「更新」ボタンが存在すること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);
                const updateButton = await screen.findByRole("button", { name: "更新" });

                // Assert
                expect(updateButton).toBeInTheDocument();
                expect(updateButton).toBeDisabled();
            });
        });

        describe("バリデーション", () => {
            describe("表示名", () => {
                it("「表示名」に3文字以上の入力でバリデーションエラーが発生しないこと", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const input = await screen.findByDisplayValue(displayName);
                    await user.clear(input);
                    await user.type(input, "a".repeat(3));
                    await user.tab();

                    // Assert
                    const validationErrMsg = screen.queryByText("3文字以上で入力してください");
                    expect(validationErrMsg).not.toBeInTheDocument();
                });

                it("「表示名」に20文字以内の入力でバリデーションエラーが発生しないこと", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const input = await screen.findByDisplayValue(displayName);
                    await user.clear(input);
                    await user.type(input, "a".repeat(20));
                    await user.tab();

                    // Assert
                    const validationErrMsg = screen.queryByText("20文字以内で入力してください");
                    expect(validationErrMsg).not.toBeInTheDocument();
                });

                it("バリデーションエラーが発生しないとき、「更新」ボタンが有効であること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const input = await screen.findByDisplayValue(displayName);
                    await user.clear(input);
                    await user.type(input, "a".repeat(20));
                    await user.tab();

                    // Assert
                    const updateButton = screen.getByRole("button", { name: "更新" });
                    expect(updateButton).toBeEnabled();
                });
            });

            describe("Email", () => {
                it("「Email」にemail形式の文字列入力でバリデーションエラーが発生しないこと", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const input = await screen.findByDisplayValue(email);
                    await user.clear(input);
                    await user.type(input, "hoge@example.jp");
                    await user.tab();

                    // Assert
                    const validationErrMsg = screen.queryByText("不正なメールアドレスです");
                    expect(validationErrMsg).not.toBeInTheDocument();
                });

                it("バリデーションエラーが発生しないとき、「更新」ボタンが有効であること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const input = await screen.findByDisplayValue(email);
                    await user.clear(input);
                    await user.type(input, "hoge@example.jp");
                    await user.tab();

                    // Assert
                    const updateButton = screen.getByRole("button", { name: "更新" });
                    expect(updateButton).toBeEnabled();
                });
            });
        });

        describe("ボタン制御", () => {
            describe("「画像更新」ボタン", () => {
                it("画像更新すると「ユーザプロフィール画像更新API」が叩かれること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const file = new File(["dummy"], "test.png", { type: "image/jpeg" });
                    const fileInput = document.querySelector(
                        'input[type="file"]',
                    ) as HTMLInputElement;
                    await user.upload(fileInput, file);

                    // Assert
                    expect(mockUpdateUserProfileApi).toHaveBeenCalledTimes(1);
                    // モック側でファイルを取り出そうとするとエラーになるため、パスパラメータのuserIdのみ確認
                    expect(mockUpdateUserProfileApi).toHaveBeenCalledWith({ userId });
                });
            });

            describe("「キャンセル」ボタン", () => {
                it("「キャンセル」ボタン押下で「ユーザ更新API」が叩かれないこと", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);
                    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
                    await user.click(cancelButton);

                    // Assert
                    expect(mockUpdateUserApi).toHaveBeenCalledTimes(0);
                });

                it("「キャンセル」ボタン押下で「ログアウトAPI」が叩かれないこと", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);
                    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
                    await user.click(cancelButton);

                    // Assert
                    expect(mockLogoutApi).toHaveBeenCalledTimes(0);
                });

                it("「キャンセル」ボタン押下後にログイン画面に遷移しないこと", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);
                    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
                    await user.click(cancelButton);

                    // Assert
                    expect(mockReplace).toHaveBeenCalledTimes(0);
                });

                it("「キャンセル」ボタン押下後にダイアログが閉じること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);
                    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
                    await user.click(cancelButton);

                    // Assert
                    await waitFor(() => {
                        const dialog = screen.queryByRole("dialog");
                        expect(dialog).not.toBeInTheDocument();
                    });
                });
            });

            describe("「ログアウト」ボタン", () => {
                it("「ログアウト」ボタン押下で「ログアウトAPI」が叩かれること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);
                    const logoutButton = screen.getByRole("button", { name: "ログアウト" });
                    await user.click(logoutButton);

                    // Assert
                    expect(mockLogoutApi).toHaveBeenCalledTimes(1);
                });

                it("「ログアウト」ボタン押下後にログイン画面に遷移すること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);
                    const logoutButton = screen.getByRole("button", { name: "ログアウト" });
                    await user.click(logoutButton);

                    // Assert
                    await waitFor(() => {
                        expect(mockReplace).toHaveBeenCalledTimes(1);
                        expect(mockReplace).toHaveBeenCalledWith("/login");
                    });
                });
            });

            describe("「更新」ボタン", () => {
                it("「更新」ボタン押下で「ユーザ更新API」が叩かれること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();
                    const changedDisplayName = "test-user";
                    const changedEmail = "test-user@example.com";

                    // Act
                    await user.click(dialogOpenButton);

                    const displayNameInput = await screen.findByDisplayValue(displayName);
                    await user.clear(displayNameInput);
                    await user.type(displayNameInput, changedDisplayName);

                    const emailInput = screen.getByDisplayValue(email);
                    await user.clear(emailInput);
                    await user.type(emailInput, changedEmail);

                    const updateButton = screen.getByRole("button", { name: "更新" });
                    await user.click(updateButton);

                    // Assert
                    expect(mockUpdateUserApi).toHaveBeenCalledTimes(1);
                    expect(mockUpdateUserApi).toHaveBeenCalledWith({
                        userId,
                        email: changedEmail,
                        displayName: changedDisplayName,
                    });
                });

                it("「更新」ボタン押下後にダイアログが閉じること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const displayNameInput = await screen.findByDisplayValue(displayName);
                    await user.clear(displayNameInput);
                    await user.type(displayNameInput, "a".repeat(3));

                    const updateButton = screen.getByRole("button", { name: "更新" });
                    await user.click(updateButton);

                    // Assert
                    await waitFor(() => {
                        const dialog = screen.queryByRole("dialog");
                        expect(dialog).not.toBeInTheDocument();
                    });
                });
            });
        });
    });

    describe("異常系", () => {
        describe("バリデーション", () => {
            describe("表示名", () => {
                it("「表示名」に2文字以内の入力でバリデーションエラーが発生する", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const input = await screen.findByDisplayValue(displayName);
                    await user.clear(input);
                    await user.type(input, "a".repeat(2));
                    await user.tab();

                    // Assert
                    const validationErrMsg = screen.queryByText("3文字以上で入力してください");
                    expect(validationErrMsg).toBeInTheDocument();
                });

                it("「表示名」に21文字以上の入力でバリデーションエラーが発生すること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const input = await screen.findByDisplayValue(displayName);
                    await user.clear(input);
                    await user.type(input, "a".repeat(21));
                    await user.tab();

                    // Assert
                    const validationErrMsg = screen.queryByText("20文字以内で入力してください");
                    expect(validationErrMsg).toBeInTheDocument();
                });

                it("バリデーションエラーが発生した、「更新」ボタンが無効であること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const input = await screen.findByDisplayValue(displayName);
                    await user.clear(input);
                    await user.type(input, "a".repeat(21));
                    await user.tab();

                    // Assert
                    const updateButton = screen.getByRole("button", { name: "更新" });
                    expect(updateButton).toBeDisabled();
                });
            });

            describe("Email", () => {
                it("「Email」にemail形式以外の文字列入力でバリデーションエラーが発生すること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const input = await screen.findByDisplayValue(email);
                    await user.clear(input);
                    await user.type(input, "hoge@example");
                    await user.tab();

                    // Assert
                    const validationErrMsg = screen.queryByText("不正なメールアドレスです");
                    expect(validationErrMsg).toBeInTheDocument();
                });

                it("バリデーションエラーが発生した、「更新」ボタンが無効であること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const input = await screen.findByDisplayValue(email);
                    await user.clear(input);
                    await user.type(input, "hoge@example");
                    await user.tab();

                    // Assert
                    const updateButton = screen.getByRole("button", { name: "更新" });
                    expect(updateButton).toBeDisabled();
                });
            });
        });

        describe("ボタン制御", () => {
            describe("「画像更新」ボタン", () => {
                it("画像更新に失敗するとダイアログが閉じること", async () => {
                    // Arrange
                    const errorDetail = new ErrorDetail(
                        ERROR_CODES.ERROR_SERVER_UNKNOWN,
                        ERROR_MESSAGES.ERROR_SERVER_UNKNOWN,
                        HttpStatusCode.InternalServerError,
                    );
                    server.use(
                        http.patch<{ userId: string }>("/api/users/:userId/profile", () => {
                            return HttpResponse.json(
                                { errorDetail },
                                { status: errorDetail.status },
                            );
                        }),
                    );
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const file = new File(["dummy"], "test.png", { type: "image/jpeg" });
                    const fileInput = document.querySelector(
                        'input[type="file"]',
                    ) as HTMLInputElement;
                    await user.upload(fileInput, file);

                    // Assert
                    await waitFor(() => {
                        const dialog = screen.queryByRole("dialog");
                        expect(dialog).not.toBeInTheDocument();
                    });
                });

                it("画像更新に失敗するとエラートーストが表示されること", async () => {
                    // Arrange
                    const status = HttpStatusCode.InternalServerError;
                    const errorDetail = new ErrorDetail(
                        ERROR_CODES.ERROR_SERVER_UNKNOWN,
                        ERROR_MESSAGES.ERROR_SERVER_UNKNOWN,
                        HttpStatusCode.InternalServerError,
                    );
                    server.use(
                        http.patch<{ userId: string }>("/api/users/:userId/profile", () => {
                            return HttpResponse.json(
                                { errorDetail },
                                { status: errorDetail.status },
                            );
                        }),
                    );
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const file = new File(["dummy"], "test.png", { type: "image/jpeg" });
                    const fileInput = document.querySelector(
                        'input[type="file"]',
                    ) as HTMLInputElement;
                    await user.upload(fileInput, file);

                    // Assert
                    const errMsg = screen.getByText(errorDetail.errMsg);
                    expect(errMsg).toBeInTheDocument();
                });
            });

            describe("「ログアウト」ボタン", () => {
                it("ログアウトに失敗するとダイアログが閉じること", async () => {
                    // Arrange
                    const errorDetail = new ErrorDetail(
                        ERROR_CODES.ERROR_SERVER_UNKNOWN,
                        ERROR_MESSAGES.ERROR_SERVER_UNKNOWN,
                        HttpStatusCode.InternalServerError,
                    );
                    server.use(
                        http.post("/api/logout", () => {
                            return HttpResponse.json(
                                { errorDetail },
                                { status: errorDetail.status },
                            );
                        }),
                    );
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const logoutButton = await screen.findByRole("button", { name: "ログアウト" });
                    await user.click(logoutButton);

                    // Assert
                    await waitFor(() => {
                        const dialog = screen.queryByRole("dialog");
                        expect(dialog).not.toBeInTheDocument();
                    });
                });

                it("ログアウトに失敗するとエラートーストが表示されること", async () => {
                    // Arrange
                    const errorDetail = new ErrorDetail(
                        ERROR_CODES.ERROR_SERVER_UNKNOWN,
                        ERROR_MESSAGES.ERROR_SERVER_UNKNOWN,
                        HttpStatusCode.InternalServerError,
                    );
                    server.use(
                        http.post("/api/logout", () => {
                            return HttpResponse.json(
                                { errorDetail },
                                { status: errorDetail.status },
                            );
                        }),
                    );
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const logoutButton = await screen.findByRole("button", { name: "ログアウト" });
                    await user.click(logoutButton);

                    // Assert
                    const errMsg = screen.getByText(errorDetail.errMsg);
                    expect(errMsg).toBeInTheDocument();
                });
            });

            describe("「更新」ボタン", () => {
                it("更新に失敗するとダイアログが閉じること", async () => {
                    // Arrange
                    const errorDetail = new ErrorDetail(
                        ERROR_CODES.ERROR_SERVER_UNKNOWN,
                        ERROR_MESSAGES.ERROR_SERVER_UNKNOWN,
                        HttpStatusCode.InternalServerError,
                    );
                    server.use(
                        http.patch<{ userId: string }>("/api/users/:userId", () => {
                            return HttpResponse.json(
                                { errorDetail },
                                { status: errorDetail.status },
                            );
                        }),
                    );
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const displayNameInput = await screen.findByDisplayValue(displayName);
                    await user.clear(displayNameInput);
                    await user.type(displayNameInput, "a".repeat(3));

                    const updateButton = screen.getByRole("button", { name: "更新" });
                    await user.click(updateButton);

                    // Assert
                    await waitFor(() => {
                        const dialog = screen.queryByRole("dialog");
                        expect(dialog).not.toBeInTheDocument();
                    });
                });

                it("更新に失敗するとエラートーストが表示されること", async () => {
                    // Arrange
                    const errorDetail = new ErrorDetail(
                        ERROR_CODES.ERROR_SERVER_UNKNOWN,
                        ERROR_MESSAGES.ERROR_SERVER_UNKNOWN,
                        HttpStatusCode.InternalServerError,
                    );
                    server.use(
                        http.patch<{ userId: string }>("/api/users/:userId", () => {
                            return HttpResponse.json(
                                { errorDetail },
                                { status: errorDetail.status },
                            );
                        }),
                    );
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const displayNameInput = await screen.findByDisplayValue(displayName);
                    await user.clear(displayNameInput);
                    await user.type(displayNameInput, "a".repeat(3));

                    const updateButton = screen.getByRole("button", { name: "更新" });
                    await user.click(updateButton);

                    // Assert
                    const errMsg = screen.getByRole("alert");
                    expect(errMsg).toBeInTheDocument();
                    expect(errMsg).toHaveTextContent(errorDetail.errMsg);
                });
            });
        });
    });
});
