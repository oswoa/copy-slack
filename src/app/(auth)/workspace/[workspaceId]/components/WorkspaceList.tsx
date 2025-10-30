"use client";

import { Avatar, List, ListItem, ListItemAvatar, ListItemButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { Workspace } from "@/app/common/Workspace";
import { usePathname } from "next/navigation";

import styles from "./WorkspaceList.module.css";

type ListProps = {
    workspaces: Workspace[];
    onClick: (srcPath: string, dstPath: string) => void;
};

const WorkspaceList = ({ workspaces, onClick }: ListProps) => {
    const basePath = "/workspace";
    const currentPath = usePathname();

    return (
        <List>
            {workspaces.map((workspace) => {
                const isSamePath = currentPath === `${basePath}/${workspace.workspaceId}`;

                return (
                    <ListItem
                        key={workspace.workspaceId}
                        className={isSamePath ? styles.active : ""}
                        onClick={() => {
                            const dstPath = `${basePath}/${workspace.workspaceId}`;
                            onClick(currentPath, dstPath);
                        }}
                        disablePadding
                    >
                        <ListItemAvatar>
                            <ListItemButton divider>
                                <Avatar sx={{ padding: "3px" }}>
                                    {workspace.workspaceName.at(0)}
                                </Avatar>
                            </ListItemButton>
                        </ListItemAvatar>
                    </ListItem>
                );
            })}
            <ListItem key={"addButton"} onClick={() => console.log("add button")} disablePadding>
                <ListItemAvatar>
                    <ListItemButton divider>
                        <Avatar sx={{ padding: "3px" }}>
                            <AddIcon />
                        </Avatar>
                    </ListItemButton>
                </ListItemAvatar>
            </ListItem>
        </List>
    );
};

export default WorkspaceList;
