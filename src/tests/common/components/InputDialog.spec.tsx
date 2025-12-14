import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import InputDialog from "@/app/common/components/InputDialog";

type DisplayDialogProps = {
    editMode?: boolean;
};

describe("InputDialog", () => {
    const mockOnSubmit = vi.fn();
    const DisplayDialog = ({ editMode }: DisplayDialogProps) => {
        const [open, setOpen] = useState(false);

        return (
            <>
                <button onClick={() => setOpen(true)}>open</button>
                {open ? (
                    <InputDialog
                        open={open}
                        title={"title"}
                        content={"description"}
                        label={"label"}
                        btnText={"OK"}
                        onSubmit={mockOnSubmit}
                        onClose={() => setOpen(false)}
                        editMode={editMode}
                    />
                ) : null}
            </>
        );
    };

    describe("正常系", () => {
        describe("初期表示", () => {
            describe("編集モードが無効", () => {
                it("タイトルが「title」であること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);
                    const title = await screen.findByRole("heading", { level: 2 });

                    // Assert
                    expect(title).toHaveTextContent("title");
                });

                it("説明が「description」であること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);
                    const description = await screen.findByText("description");

                    // Assert
                    expect(description).toHaveTextContent("description");
                });

                it("ラベルが「label」であること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);
                    const label = screen.getByText("label");

                    // Assert
                    expect(label).toHaveTextContent("label");
                });

                it("「OK」ボタンが存在すること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);
                    const yesButton = await screen.findByRole("button", { name: "OK" });

                    // Assert
                    expect(yesButton).toBeInTheDocument();
                    expect(yesButton).toBeDisabled();
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

                it("input要素としてレンダリングされること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);
                    const input = await screen.findByRole("textbox");

                    // Assert
                    expect(input.tagName).toBe("INPUT");
                });
            });

            describe("編集モードが有効", () => {
                it("textarea要素としてレンダリングされること", async () => {
                    // Arrange
                    render(<DisplayDialog editMode />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);
                    const input = await screen.findByRole("textbox");

                    // Assert
                    expect(input.tagName).toBe("TEXTAREA");
                });
            });
        });

        describe("バリデーション", () => {
            describe("編集モードが無効", () => {
                it("input要素に3文字以上の入力でバリデーションエラーが発生しないこと", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const input = await screen.findByRole("textbox");
                    await user.type(input, "a".repeat(3));
                    await user.tab();

                    // Assert
                    const validationErrMsg = screen.queryByText("3文字以上で入力してください");
                    expect(validationErrMsg).not.toBeInTheDocument();
                });

                it("input要素に20文字以内の入力でバリデーションエラーが発生しないこと", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const input = await screen.findByRole("textbox");
                    await user.type(input, "a".repeat(20));
                    await user.tab();

                    // Assert
                    const validationErrMsg = screen.queryByText("20文字以内で入力してください");
                    expect(validationErrMsg).not.toBeInTheDocument();
                });
            });

            describe("編集モードが有効", () => {
                it("input要素に2文字以内の入力でバリデーションエラーが発生しないこと", async () => {
                    // Arrange
                    render(<DisplayDialog editMode />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const input = await screen.findByRole("textbox");
                    await user.type(input, "a".repeat(2));
                    await user.tab();

                    // Assert
                    const validationErrMsg = screen.queryByText("3文字以上で入力してください");
                    expect(validationErrMsg).not.toBeInTheDocument();
                });

                it("input要素に21文字以上の入力でバリデーションエラーが発生しないこと", async () => {
                    // Arrange
                    render(<DisplayDialog editMode />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    const input = await screen.findByRole("textbox");
                    await user.type(input, "a".repeat(21));
                    await user.tab();

                    // Assert
                    const validationErrMsg = screen.queryByText("20文字以内で入力してください");
                    expect(validationErrMsg).not.toBeInTheDocument();
                });
            });
        });

        describe("ボタン制御", () => {
            describe("「OK」ボタン", () => {
                it("「OK」ボタン押下で指定したハンドラが動くこと", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    // OKボタンも物理的に押せる状況は作っておく
                    const input = await screen.findByRole("textbox");
                    await user.type(input, "a".repeat(3));
                    await user.tab();

                    const yesButton = screen.getByRole("button", { name: "OK" });
                    expect(yesButton).toBeEnabled();
                    await user.click(yesButton);

                    // Assert
                    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
                });

                it("「OK」ボタン押下後にダイアログが閉じること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    // OKボタンも物理的に押せる状況は作っておく
                    const input = await screen.findByRole("textbox");
                    await user.type(input, "a".repeat(3));
                    await user.tab();

                    const yesButton = screen.getByRole("button", { name: "OK" });
                    await user.click(yesButton);

                    // Assert
                    await waitFor(() => {
                        const dialog = screen.queryByRole("dialog");
                        expect(dialog).not.toBeInTheDocument();
                    });
                });
            });

            describe("「キャンセル」ボタン", () => {
                it("「キャンセル」ボタン押下で指定したハンドラが動かないこと", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    // OKボタンも物理的に押せる状況は作っておく
                    const input = await screen.findByRole("textbox");
                    await user.type(input, "a".repeat(3));
                    await user.tab();

                    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
                    await user.click(cancelButton);

                    // Assert
                    expect(mockOnSubmit).toHaveBeenCalledTimes(0);
                });

                it("「キャンセル」ボタン押下後にダイアログが閉じること", async () => {
                    // Arrange
                    render(<DisplayDialog />);
                    const dialogOpenButton = screen.getByRole("button", { name: "open" });
                    const user = userEvent.setup();

                    // Act
                    await user.click(dialogOpenButton);

                    // OKボタンも物理的に押せる状況は作っておく
                    const input = await screen.findByRole("textbox");
                    await user.type(input, "a".repeat(3));
                    await user.tab();

                    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
                    await user.click(cancelButton);

                    // Assert
                    await waitFor(() => {
                        const dialog = screen.queryByRole("dialog");
                        expect(dialog).not.toBeInTheDocument();
                    });
                });
            });
        });
    });

    describe("異常系（編集モード無効のみ）", () => {
        describe("バリデーション", () => {
            it("input要素に2文字以内の入力でバリデーションエラーが発生すること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);

                const input = await screen.findByRole("textbox");
                await user.type(input, "a".repeat(2));
                await user.tab();

                // Assert
                const validationErrMsg = screen.queryByText("3文字以上で入力してください");
                expect(validationErrMsg).toBeInTheDocument();
            });

            it("input要素に21文字以上の入力でバリデーションエラーが発生すること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);

                const input = await screen.findByRole("textbox");
                await user.type(input, "a".repeat(21));
                await user.tab();

                // Assert
                const validationErrMsg = screen.queryByText("20文字以内で入力してください");
                expect(validationErrMsg).toBeInTheDocument();
            });
        });
    });
});
