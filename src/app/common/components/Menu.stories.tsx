import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Menu, { Action } from "./Menu";

const meta = {
    title: "Menu",
    component: Menu,
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof Menu>;

const actions: Action[] = [
    { label: "Copy", fire: () => {} },
    { label: "Save", fire: () => {} },
    { label: "Print", fire: () => {} },
    { label: "Share", fire: () => {} },
    { label: "Dial", fire: () => {} },
];

export const Primary: Story = {
    args: {
        actions,
    },
};
