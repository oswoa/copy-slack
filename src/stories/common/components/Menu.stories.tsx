import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import Menu, { Action } from "@/app/common/components/Menu";

const meta = {
    title: "Menu",
    component: Menu,
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof Menu>;

export const Primary: Story = {
    render: () => {
        const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
        const openMenu = Boolean(anchorEl);
        const onClose = () => {
            setAnchorEl(null);
        };

        return (
            <>
                <button onClick={(e) => setAnchorEl(e.currentTarget)}>button</button>
                <Menu
                    open={openMenu}
                    anchorEl={anchorEl}
                    onClose={onClose}
                    actions={[
                        { label: "Copy", fire: () => alert("test") },
                        { label: "Save", fire: () => alert("test") },
                        { label: "Print", fire: () => alert("test") },
                        { label: "Share", fire: () => alert("test") },
                        { label: "Dial", fire: () => alert("test") },
                    ]}
                />
            </>
        );
    },
};
