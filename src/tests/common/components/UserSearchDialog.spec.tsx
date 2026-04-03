import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import UserSearchDialog from "@/app/common/components/UserSearchDialog";
import { ToastProvider } from "@/app/context/ToastContext";
import { mockGetUserListApi } from "@/tests/handlers";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/node";
import { HttpStatusCode } from "axios";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { User } from "@/model/User";
import { wait } from "@testing-library/user-event/dist/cjs/utils/index.js";

describe("UserSearchDialog", () => {
    const mockOnSubmit = vi.fn();
    const currentUserId = "user1";
    const DisplayDialog = () => {
        const [open, setOpen] = useState(false);
        const [, setSelectedUser] = useState<User>();

        return (
            <ToastProvider>
                <button onClick={() => setOpen(true)}>open</button>
                {open ? (
                    <UserSearchDialog
                        open={open}
                        onClose={() => setOpen(false)}
                        onSubmit={mockOnSubmit}
                        setSelectedUser={setSelectedUser}
                        currentUserId={currentUserId}
                    />
                ) : null}
            </ToastProvider>
        );
    };

    describe("正常系", () => {
        describe("初期表示", () => {
            it("タイトルが「ユーザ検索」であること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);
                const title = await screen.findByRole("heading", { level: 2 });

                // Assert
                expect(title).toHaveTextContent("ユーザ検索");
            });

            it("説明が「ユーザ名を入力してください」であること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);
                const description = await screen.findByText("ユーザ名を入力してください");

                // Assert
                expect(description).toBeInTheDocument();
            });

            it("ラベルが「ユーザ名」であること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);
                const label = screen.getByText("ユーザ名");

                // Assert
                expect(label).toBeInTheDocument();
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
        });

        describe("ボタン制御", () => {
            it("「キャンセル」ボタン押下で「ユーザ一覧取得API」が叩かれないこと", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);

                const cancelButton = screen.getByRole("button", { name: "キャンセル" });
                await user.click(cancelButton);

                // Assert
                expect(mockGetUserListApi).toHaveBeenCalledTimes(0);
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

        describe("ユーザ検索", () => {
            it("検索ボックスにユーザ名入力で「ユーザ一覧取得API」が叩かれること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);

                const input = screen.getByRole("textbox");
                await user.type(input, "user");
                const listItems = await screen.findAllByRole("listitem");

                // Assert
                await waitFor(
                    () => {
                        expect(listItems.length).toBe(2);
                        const user2 = listItems[0];
                        const user3 = listItems[1];
                        expect(user2).toHaveTextContent("ユーザ2");
                        expect(user3).toHaveTextContent("ユーザ3");
                        expect(mockGetUserListApi).toHaveBeenCalledTimes(1);
                        expect(mockGetUserListApi).toHaveBeenCalledWith({ displayName: "user" });
                    },
                    { timeout: 10000 },
                );
            });

            it("検索結果のユーザを選択すると指定したハンドラが動くこと", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);

                const input = screen.getByRole("textbox");
                await user.type(input, "user");

                const listItems = await screen.findAllByRole("listitem");
                expect(listItems.length).toBe(2);
                const selectedUser = listItems[0];
                await user.click(selectedUser);

                // Assert
                await waitFor(
                    () => {
                        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
                        expect(mockOnSubmit).toHaveBeenCalledWith({
                            userId: "user2",
                            email: "",
                            displayName: "ユーザ2",
                            imageUrl: "",
                        });
                    },
                    { timeout: 10000 },
                );
            });

            it("検索結果のユーザを選択するとダイアログが閉じること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);

                const input = screen.getByRole("textbox");
                await user.type(input, "user");

                const listItems = await screen.findAllByRole("listitem");
                expect(listItems.length).toBe(2);
                const selectedUser = listItems[0];
                await user.click(selectedUser);

                // Assert
                await waitFor(
                    () => {
                        const dialog = screen.queryByRole("dialog");
                        expect(dialog).not.toBeInTheDocument();
                    },
                    { timeout: 10000 },
                );
            });
        });
    });

    describe("異常系", () => {
        describe("ユーザ検索", () => {
            it("ユーザ検索に失敗するとエラートーストが表示されること", async () => {
                // Arrange
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_SERVER_UNKNOWN,
                    ERROR_MESSAGES.ERROR_SERVER_UNKNOWN,
                    HttpStatusCode.InternalServerError,
                );
                server.use(
                    http.get("/api/users", async () => {
                        return HttpResponse.json({ errorDetail }, { status: errorDetail.status });
                    }),
                );

                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);

                const input = screen.getByRole("textbox");
                await user.type(input, "user");

                // Assert
                await waitFor(
                    () => {
                        const errMsg = screen.queryByText(errorDetail.errMsg);
                        expect(errMsg).toBeInTheDocument();
                    },
                    { timeout: 10000 },
                );
            });

            it("ユーザ検索に失敗するとダイアログが閉じること", async () => {
                // Arrange
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_SERVER_UNKNOWN,
                    ERROR_MESSAGES.ERROR_SERVER_UNKNOWN,
                    HttpStatusCode.InternalServerError,
                );
                server.use(
                    http.get("/api/users", async () => {
                        return HttpResponse.json({ errorDetail }, { status: errorDetail.status });
                    }),
                );
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);

                const input = screen.getByRole("textbox");
                await user.type(input, "user");

                // Assert
                await waitFor(
                    () => {
                        const dialog = screen.queryByRole("dialog");
                        expect(dialog).not.toBeInTheDocument();
                    },
                    { timeout: 10000 },
                );
            });
        });
    });
}, 3000);
