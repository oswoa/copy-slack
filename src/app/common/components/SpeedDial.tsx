import { SpeedDial as MuiSpeedDial } from "@mui/material";
import SpeedDialAction from "@mui/material/SpeedDialAction";

import MenuIcon from "@mui/icons-material/Menu";
import { JSX } from "react";

export type Action = {
    icon: JSX.Element;
    name: string;
    onClick: () => void;
};

export type SpeedDialProps = {
    actions: Action[];
};

const SpeedDial = ({ actions }: SpeedDialProps) => {
    return (
        <MuiSpeedDial ariaLabel={"Speed Dial"} icon={<MenuIcon />}>
            {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    onClick={action.onClick}
                    slotProps={{
                        tooltip: {
                            title: action.name,
                        },
                    }}
                />
            ))}
        </MuiSpeedDial>
    );
};

export default SpeedDial;
