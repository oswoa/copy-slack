import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ConfirmDialog from "@/app/common/components/ConfirmDialog";

const meta = {
    title: "ConfirmDialog",
    component: ConfirmDialog,
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Primary: Story = {
    args: {
        open: true,
        title: "タイトル",
        content: "内容",
        onAgree: () => {},
        onClose: () => {},
    },

    render: (args) => {
        return <ConfirmDialog {...args} onAgree={() => alert("Agree")} />;
    },
};
