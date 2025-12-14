import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import Toast from "@/app/common/components/Toast";

describe("Toast", () => {
    const DisplayToast = () => {
        const [open, setOpen] = useState(false);
        const [msg, setMsg] = useState("");

        return (
            <>
                <button
                    onClick={() => {
                        setOpen(true);
                        setMsg("Toast is opened");
                    }}
                >
                    open
                </button>
                {open && (
                    <Toast
                        msg={msg}
                        severity={"error"}
                        open={open}
                        setOpen={() => setOpen(false)}
                        autoHideDuration={100}
                    />
                )}
            </>
        );
    };

    describe("初期表示", () => {
        it("Toastが表示されること", async () => {
            // Arrange
            render(<DisplayToast />);
            const toastOpenButton = screen.getByRole("button", { name: "open" });
            const user = userEvent.setup();

            // Act
            await user.click(toastOpenButton);
            const toast = screen.getByRole("alert");

            // Assert
            expect(toast).toBeInTheDocument();
        });

        it("Toastに「Toast is opened」と表示されていること", async () => {
            // Arrange
            render(<DisplayToast />);
            const toastOpenButton = screen.getByRole("button", { name: "open" });
            const user = userEvent.setup();

            // Act
            await user.click(toastOpenButton);
            const toast = screen.getByRole("alert");

            // Assert
            expect(toast).toHaveTextContent("Toast is opened");
        });

        it("100ms後にToastが消えること", async () => {
            // Arrange
            render(<DisplayToast />);
            const toastOpenButton = screen.getByRole("button", { name: "open" });
            const user = userEvent.setup();

            // Act
            await user.click(toastOpenButton);
            const toast = screen.getByText("Toast is opened");
            expect(toast).toBeInTheDocument();

            // Assert
            await waitFor(
                () => {
                    const closedToast = screen.queryByText("Toast is opened");
                    expect(closedToast).not.toBeInTheDocument();
                },
                { timeout: 150 }
            );
        });
    });
});
