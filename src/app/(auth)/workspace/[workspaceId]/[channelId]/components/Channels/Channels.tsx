"use client";

import { List, ListItem, ListItemButton } from "@mui/material";
import { usePathname } from "next/navigation";

type ChannelsProps = {
    channels: string[];
    workspaceId: string;
    onClick: (srcPath: string, dstPath: string) => void;
};

const ChannelList = ({ channels, workspaceId, onClick }: ChannelsProps) => {
    const basePath = "/workspace";
    const currentPath = usePathname();

    return (
        <List>
            {channels.map((channel) => {
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
