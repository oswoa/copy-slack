import { ReactElement } from "react";
import { PopperProps, Tooltip as MuiTooltip } from "@mui/material";

type TooltipProps = {
    keyVal?: string;
    title: string;
    placement?: PopperProps["placement"];
    children: ReactElement;
};

const Tooltip = ({ keyVal, title, placement = "right", children }: TooltipProps) => {
    return (
        <MuiTooltip
            key={keyVal}
            title={title}
            placement={placement}
            slotProps={{
                tooltip: {
                    sx: {
                        fontSize: ".8rem",
                    },
                },
            }}
        >
            {children}
        </MuiTooltip>
    );
};

export default Tooltip;
