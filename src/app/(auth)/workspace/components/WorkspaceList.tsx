"use client";

import { Button, List, ListItem, ListItemAvatar } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { Workspace } from "@/app/common/Workspace";

type ListProps = {
    workspaces: Workspace[];
};

const WorkspaceList = ({ workspaces }: ListProps) => {
    return (
        <List>
            {workspaces.map((workspace) => {
                return (
                    <ListItem
                        key={workspace.workspaceId}
                        alignItems="flex-start"
                        onClick={() => console.log(`workspace id: ${workspace.workspaceId}`)}
                        disablePadding
                    >
                        <Button variant="outlined" sx={{ borderRadius: 3 }}>
                            <ListItemAvatar>{workspace.workspaceName.at(0)}</ListItemAvatar>
                        </Button>
                    </ListItem>
                );
            })}
            <ListItem
                key={"addButton"}
                alignItems="flex-start"
                onClick={() => console.log("add button")}
                disablePadding
            >
                <Button variant="outlined" sx={{ borderRadius: 3 }}>
                    <ListItemAvatar>
                        <AddIcon />
                    </ListItemAvatar>
                </Button>
            </ListItem>
        </List>
    );
};

export default WorkspaceList;
