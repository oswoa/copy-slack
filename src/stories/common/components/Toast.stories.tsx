import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Toast from "@/app/common/components/Toast";

const meta = {
    title: "Toast",
    component: Toast,
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof Toast>;

export const Info: Story = {
    args: {
        open: true,
        msg: "test",
        severity: "info",
        setOpen: () => {},
    },
};

export const Success: Story = {
    args: {
        open: true,
        msg: "test",
        severity: "success",
        setOpen: () => {},
    },
};

export const Warning: Story = {
    args: {
        open: true,
        msg: "test",
        severity: "warning",
        setOpen: () => {},
    },
};

export const Error: Story = {
    args: {
        open: true,
        msg: "test",
        severity: "error",
        setOpen: () => {},
    },
};
