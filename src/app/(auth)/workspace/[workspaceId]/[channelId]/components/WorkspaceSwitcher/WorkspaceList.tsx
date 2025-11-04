"use client";

import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, Tooltip } from "@mui/material";

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
        <>
            {workspaces.map((workspace) => {
                const isIncluded = currentPath.includes(`${basePath}/${workspace.workspaceId}`);
                return (
                    <Tooltip
                        key={workspace.workspaceId}
                        title={workspace.workspaceName}
                        placement={"right"}
                        slotProps={{
                            tooltip: {
                                sx: {
                                    fontSize: "1rem",
                                },
                            },
                        }}
                    >
                        <ListItem
                            className={isIncluded ? styles.active : ""}
                            onClick={() => {
                                const dstPath = `${basePath}/${workspace.workspaceId}/general`;
                                onClick(currentPath, dstPath);
                            }}
                            sx={{ borderRadius: 2 }}
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
                    </Tooltip>
                );
            })}
        </>
    );
};

export default WorkspaceList;
