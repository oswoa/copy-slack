"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Channel } from "@prisma/client";

import { List, ListItem, ListItemButton } from "@mui/material";

import { GetChannelListApiResponse } from "@/app/api/channels/route";

import Toast from "@/app/common/components/Toast";
import { ErrorDetail } from "@/app/common/ErrorDetail";

import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

import styles from "./Channels.module.css";

type ChannelsProps = {
    workspaceId: string;
    channels: Channel[];
    setChannels: (channels: Channel[]) => void;
    onClick: (srcPath: string, dstPath: string) => void;
};

// TODO: +ボタンでチャネルを追加する
const ChannelList = ({ workspaceId, channels, setChannels, onClick }: ChannelsProps) => {
    const basePath = "/workspace";
    const currentPath = usePathname();

    const [toastOpen, setToastOpen] = useState(false);
    const [toastErrMsg, setToastErrMsg] = useState("");

    const fetchChannels = async () => {
        let errorDetail: ErrorDetail;

        const res = await fetch(`/api/channels?workspaceId=${workspaceId}`);
        const data: GetChannelListApiResponse = await res.json();

        errorDetail = ErrorDetail.getFromJson(data.errorDetail);
        if (!errorDetail.success) {
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
            return;
        }

        const channels = data.channels;
        if (channels.length <= 0) {
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
            return;
        }

        setChannels(channels);
    };

    useEffect(() => {
        fetchChannels();
    }, []);

    return (
        <>
            <List>
                {channels?.map((channel) => {
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
            <Toast msg={toastErrMsg} severity={"error"} open={toastOpen} setOpen={setToastOpen} />
        </>
    );
};

export default ChannelList;
