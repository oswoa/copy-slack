import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import Tooltip from "@/app/common/components/Tooltip";

describe("Tooltip", () => {
    const DisplayTooltip = () => {
        return (
            <Tooltip title={"ツールチップを表示"}>
                <button>button</button>
            </Tooltip>
        );
    };

    afterEach(cleanup);

    describe("初期表示", () => {
        it("button要素にホバーでTooltipが表示されること", async () => {
            // Arrange
            render(<DisplayTooltip />);
            const user = userEvent.setup();

            // Act
            const tooltipBeforeHovering = screen.queryByRole("tooltip");
            expect(tooltipBeforeHovering).not.toBeInTheDocument();

            const btn = screen.getByRole("button");
            await user.hover(btn);

            // Assert
            const tooltipAfterHovering = await screen.findByRole("tooltip");
            expect(tooltipAfterHovering).toBeInTheDocument();
        });
    });
});
