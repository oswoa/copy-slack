import { Menu as MuiMenu, MenuItem } from "@mui/material";

export type Action = {
    label: string;
    fire: () => void;
};

export type MenuProps = {
    open: boolean;
    anchorEl: HTMLElement | null;
    actions: Action[];
    onClose: () => void;
};

const Menu = ({ open, anchorEl, actions, onClose }: MenuProps) => {
    return (
        <MuiMenu anchorEl={anchorEl} open={open} onClose={onClose}>
            {actions.map((action) => {
                return (
                    <MenuItem
                        key={action.label}
                        onClick={() => {
                            action.fire();
                            onClose();
                        }}
                    >
                        {action.label}
                    </MenuItem>
                );
            })}
        </MuiMenu>
    );
};

export default Menu;
