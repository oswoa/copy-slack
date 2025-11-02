"use client";

import { List, ListItem, ListItemButton } from "@mui/material";
import { usePathname } from "next/navigation";

import { useUserWorkspaces } from "@/app/context/UserWorkspacesContext";

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
                return (
                    <ListItem key={channel}>
                        <ListItemButton
                            onClick={() => {
                                const dstPath = `${basePath}/${workspaceId}/${channel}`;
                                onClick(currentPath, dstPath);
                            }}
                        >
                            #{channel}
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
    );
};

export default ChannelList;
