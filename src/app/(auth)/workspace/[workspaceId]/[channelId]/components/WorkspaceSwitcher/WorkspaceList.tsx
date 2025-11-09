"use client";

import { usePathname } from "next/navigation";
import { Workspace } from "@prisma/client";
import { useState } from "react";

import { Avatar, ListItem, ListItemAvatar, ListItemButton, Tooltip } from "@mui/material";

import { GetChannelListApiResponse } from "@/app/api/channels/route";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import Toast from "@/app/common/components/Toast";

import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

import styles from "./WorkspaceList.module.css";

type ListProps = {
    workspaces: Workspace[];
    onClick: (srcPath: string, dstPath: string) => void;
};

const WorkspaceList = ({ workspaces, onClick }: ListProps) => {
    const basePath = "/workspace";
    const currentPath = usePathname();

    const [toastOpen, setToastOpen] = useState(false);
    const [toastErrMsg, setToastErrMsg] = useState("");

    const fetchFirstChannel = async (workspaceId: string) => {
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

        return channels[0];
    };

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
                            onClick={async () => {
                                if (isIncluded) {
                                    return;
                                }

                                const channel = await fetchFirstChannel(workspace.workspaceId);
                                if (channel) {
                                    const dstPath = `${basePath}/${workspace.workspaceId}/${channel.channelId}`;
                                    onClick(currentPath, dstPath);
                                }
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
            <Toast msg={toastErrMsg} severity={"error"} open={toastOpen} setOpen={setToastOpen} />;
        </>
    );
};

export default WorkspaceList;
