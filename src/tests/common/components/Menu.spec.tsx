import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import Menu from "@/app/common/components/Menu";

describe("Menu", () => {
    const mockMenuOnEdit = vi.fn();
    const mockMenuOnDelete = vi.fn();
    const DisplayMenu = () => {
        const [menuAnchorEl, setAenuAnchorEl] = useState<HTMLElement | null>(null);
        const openMenu = Boolean(menuAnchorEl);

        return (
            <>
                <button onClick={(e) => setAenuAnchorEl(e.currentTarget)}>open</button>
                {openMenu && (
                    <Menu
                        open={openMenu}
                        anchorEl={menuAnchorEl}
                        actions={[
                            {
                                label: "edit",
                                fire: () => {
                                    mockMenuOnEdit();
                                },
                            },
                            {
                                label: "delete",
                                fire: () => {
                                    mockMenuOnDelete();
                                },
                            },
                        ]}
                        onClose={() => setAenuAnchorEl(null)}
                    />
                )}
            </>
        );
    };

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    describe("初期表示", () => {
        it("「edit」メニューが存在すること", async () => {
            // Arrange
            render(<DisplayMenu />);
            const menuOpenButton = screen.getByRole("button", { name: "open" });
            const user = userEvent.setup();

            // Act
            await user.click(menuOpenButton);
            const menu = screen.getByRole("menuitem", { name: "edit" });

            // Assert
            expect(menu).toBeInTheDocument();
            expect(menu).toBeEnabled();
        });

        it("「delete」メニューが存在すること", async () => {
            // Arrange
            render(<DisplayMenu />);
            const menuOpenButton = screen.getByRole("button", { name: "open" });
            const user = userEvent.setup();

            // Act
            await user.click(menuOpenButton);
            const menuItem = screen.getByRole("menuitem", { name: "delete" });

            // Assert
            expect(menuItem).toBeInTheDocument();
            expect(menuItem).toBeEnabled();
        });
    });

    describe("メニュー制御", () => {
        describe("「edit」ボタン", () => {
            it("「edit」ボタン押下で指定したハンドラが動くこと", async () => {
                // Arrange
                render(<DisplayMenu />);
                const menuOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(menuOpenButton);
                const menuItem = screen.getByRole("menuitem", { name: "edit" });
                await user.click(menuItem);

                // Assert
                expect(mockMenuOnEdit).toHaveBeenCalledTimes(1);
            });

            it("「edit」ボタン押下で「delete」ボタンのハンドラが動かないこと", async () => {
                // Arrange
                render(<DisplayMenu />);
                const menuOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(menuOpenButton);
                const menuItem = screen.getByRole("menuitem", { name: "edit" });
                await user.click(menuItem);

                // Assert
                expect(mockMenuOnDelete).toHaveBeenCalledTimes(0);
            });

            it("「edit」ボタン押下後にメニューが閉じること", async () => {
                // Arrange
                render(<DisplayMenu />);
                const menuOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(menuOpenButton);
                const menuItem = screen.getByRole("menuitem", { name: "edit" });
                await user.click(menuItem);

                // Assert
                await waitFor(() => {
                    const menu = screen.queryByRole("menu");
                    expect(menu).not.toBeInTheDocument();
                });
            });
        });

        describe("「delete」ボタン", () => {
            it("「delete」ボタン押下で指定したハンドラが動くこと", async () => {
                // Arrange
                render(<DisplayMenu />);
                const menuOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(menuOpenButton);
                const menuItem = screen.getByRole("menuitem", { name: "delete" });
                await user.click(menuItem);

                // Assert
                expect(mockMenuOnDelete).toHaveBeenCalledTimes(1);
            });

            it("「delete」ボタン押下で「edit」ボタンのハンドラが動かないこと", async () => {
                // Arrange
                render(<DisplayMenu />);
                const menuOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(menuOpenButton);
                const menuItem = screen.getByRole("menuitem", { name: "delete" });
                await user.click(menuItem);

                // Assert
                expect(mockMenuOnEdit).toHaveBeenCalledTimes(0);
            });

            it("「delete」ボタン押下後にメニューが閉じること", async () => {
                // Arrange
                render(<DisplayMenu />);
                const menuOpenButton = screen.getByRole("button", { name: "open" });
                const user = userEvent.setup();

                // Act
                await user.click(menuOpenButton);
                const menuItem = screen.getByRole("menuitem", { name: "delete" });
                await user.click(menuItem);

                // Assert
                await waitFor(() => {
                    const menu = screen.queryByRole("menu");
                    expect(menu).not.toBeInTheDocument();
                });
            });
        });
    });
});
