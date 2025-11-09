"use client";

import { usePathname } from "next/navigation";
import { Channel } from "@prisma/client";

import { List, ListItem, ListItemButton } from "@mui/material";

import styles from "./Channels.module.css";

type ChannelsProps = {
    workspaceId: string;
    channelList: Channel[];
    onClick: (srcPath: string, dstPath: string) => void;
};

const ChannelList = ({ workspaceId, channelList, onClick }: ChannelsProps) => {
    const basePath = "/workspace";
    const currentPath = usePathname();

    return (
        <>
            <List>
                {channelList?.map((channel) => {
                    const dstPath = `${basePath}/${workspaceId}/${channel.channelId}`;
                    const isIncluded = currentPath.includes(dstPath);

                    return (
                        <ListItem key={channel.channelId}>
                            <ListItemButton
                                className={isIncluded ? styles.active : ""}
                                onClick={() => {
                                    onClick(currentPath, dstPath);
                                }}
                                sx={{ borderRadius: 2 }}
                            >
                                # {channel.channelName}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </>
    );
};

export default ChannelList;
