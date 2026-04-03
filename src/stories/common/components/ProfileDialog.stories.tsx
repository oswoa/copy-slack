import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ProfileDialog from "@/app/common/components/ProfileDialog";

const meta = {
    title: "ProfileDialog",
    component: ProfileDialog,
} satisfies Meta<typeof ProfileDialog>;

export default meta;
type Story = StoryObj<typeof ProfileDialog>;

export const Primary: Story = {
    args: {
        open: true,
        currentUser: {
            userId: "1",
            displayName: "User",
            email: "",
        },
        onClose: () => {},
    },

    render: (args) => {
        return <ProfileDialog {...args} />;
    },
};
