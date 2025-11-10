import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SpeedDial, { Action } from "./SpeedDial";

import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import FileCopyIcon from "@mui/icons-material/FileCopyOutlined";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import ShareIcon from "@mui/icons-material/Share";

const meta = {
    title: "SpeedDial",
    component: SpeedDial,
} satisfies Meta<typeof SpeedDial>;

export default meta;

type Story = StoryObj<typeof SpeedDial>;

const actions: Action[] = [
    { icon: <FileCopyIcon />, name: "Copy", onClick: () => {} },
    { icon: <SaveIcon />, name: "Save", onClick: () => {} },
    { icon: <PrintIcon />, name: "Print", onClick: () => {} },
    { icon: <ShareIcon />, name: "Share", onClick: () => {} },
    { icon: <SpeedDialIcon />, name: "Dial", onClick: () => {} },
];

export const Primary: Story = {
    args: {
        actions,
    },
};
