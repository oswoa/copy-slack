import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "./ConfirmDialog";

describe("ConfirmDialog", () => {
    const mockOnAgree = vi.fn();
    const DisplayDialog = () => {
        const [open, setOpen] = useState(false);

        return (
            <>
                <button onClick={() => setOpen(true)}>open</button>
                {open ? (
                    <ConfirmDialog
                        open={open}
                        title={"title"}
                        content={"description"}
                        onAgree={mockOnAgree}
                        onClose={() => setOpen(false)}
                    />
                ) : null}
            </>
        );
    };

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    describe("初期表示", () => {
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

        it("「はい」ボタンが存在すること", async () => {
            // Arrange
            render(<DisplayDialog />);
            const dialogOpenButton = screen.getByRole("button", { name: "open" });
            const user = userEvent.setup();

            // Act
            await user.click(dialogOpenButton);
            await screen.findByText("description");
            const buttonYes = screen.getByRole("button", { name: "はい" });

            // Assert
            expect(buttonYes).toBeInTheDocument();
            expect(buttonYes).toBeEnabled();
        });

        it("「キャンセル」ボタンが存在すること", async () => {
            // Arrange
            render(<DisplayDialog />);
            const dialogOpenButton = screen.getByRole("button", { name: "open" });
            const user = userEvent.setup();

            // Act
            await user.click(dialogOpenButton);
            await screen.findByText("description");
            const buttonCancel = screen.getByRole("button", { name: "キャンセル" });

            // Assert
            expect(buttonCancel).toBeInTheDocument();
            expect(buttonCancel).toBeEnabled();
        });
    });

    describe("ボタン制御", () => {
        describe("「はい」ボタン", () => {
            it("「はい」ボタン押下で指定したハンドラが動くこと", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);
                await screen.findByText("description");
                const buttonYes = screen.getByRole("button", { name: "はい" });
                await user.click(buttonYes);

                // Assert
                expect(mockOnAgree).toHaveBeenCalledTimes(1);
            });

            it("「はい」ボタン押下後にダイアログが閉じること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);
                await screen.findByText("description");
                const buttonYes = screen.getByRole("button", { name: "はい" });
                await user.click(buttonYes);

                // Assert
                await waitFor(() => {
                    const description = screen.queryByText("description");
                    expect(description).not.toBeInTheDocument();
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
                await screen.findByText("description");
                const buttonCancel = screen.getByRole("button", { name: "キャンセル" });
                await user.click(buttonCancel);

                // Assert
                expect(mockOnAgree).toHaveBeenCalledTimes(0);
            });

            it("「キャンセル」ボタン押下後にダイアログが閉じること", async () => {
                // Arrange
                render(<DisplayDialog />);
                const dialogOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(dialogOpenButton);
                await screen.findByText("description");
                const buttonCancel = screen.getByRole("button", { name: "キャンセル" });
                await user.click(buttonCancel);

                // Assert
                await waitFor(() => {
                    const description = screen.queryByText("description");
                    expect(description).not.toBeInTheDocument();
                });
            });
        });
    });
});
