"use client";

import { List, ListItem, ListItemButton } from "@mui/material";
import { usePathname } from "next/navigation";

import { useUserWorkspaces } from "@/app/context/UserWorkspacesContext";
import styles from "./Channels.module.css";

type ChannelsProps = {
    workspaceId: string;
    onClick: (srcPath: string, dstPath: string) => void;
};

// TODO: +ボタンでチャネルを追加する
const ChannelList = ({ workspaceId, onClick }: ChannelsProps) => {
    const basePath = "/workspace";
    const currentPath = usePathname();
    const userWorkspaces = useUserWorkspaces();

    const currentWorkspace = userWorkspaces.find(
        (workspace) => workspace.workspaceId === workspaceId
    );
    const channels = currentWorkspace?.channels;

    return (
        <List>
            {channels?.map((channel) => {
                const dstPath = `${basePath}/${workspaceId}/${channel}`;
                const isIncluded = currentPath.includes(dstPath);

                return (
                    <ListItem key={channel}>
                        <ListItemButton
                            className={isIncluded ? styles.active : ""}
                            onClick={() => {
                                onClick(currentPath, dstPath);
                            }}
                            sx={{ borderRadius: 2 }}
                        >
                            # {channel}
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
    );
};

export default ChannelList;
