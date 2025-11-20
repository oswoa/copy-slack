import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import UserSearchDialog from "@/app/common/components/UserSearchDialog";

const meta = {
    title: "UserSearchDialog",
    component: UserSearchDialog,
} satisfies Meta<typeof UserSearchDialog>;

export default meta;
type Story = StoryObj<typeof UserSearchDialog>;

export const Primary: Story = {
    args: {
        open: true,
        onClose: () => {},
        onSubmit: () => {},
    },

    render: (args) => {
        return <UserSearchDialog {...args} />;
    },
};
