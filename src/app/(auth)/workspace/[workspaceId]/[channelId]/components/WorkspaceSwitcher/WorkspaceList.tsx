"use client";

import { usePathname } from "next/navigation";
import { Workspace } from "@prisma/client";

import { Avatar, ListItem, ListItemAvatar, ListItemButton } from "@mui/material";

import { GetChannelListApiResponse } from "@/app/api/channels/route";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import Tooltip from "@/app/common/components/Tooltip";

import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";

import workspaceStyles from "./WorkspaceList.module.css";
import pageStyles from "../../page.module.css";
import { useErrToast } from "@/app/context/ToastContext";
import { HttpStatusCode } from "axios";

type ListProps = {
    workspaces: Workspace[];
    onClick: (srcPath: string, dstPath: string) => void;
};

const WorkspaceList = ({ workspaces, onClick }: ListProps) => {
    const basePath = "/workspace";
    const currentPath = usePathname();

    const { setErrToastOpen, setErrToastMsg } = useErrToast();

    const fetchFirstChannel = async (workspaceId: string) => {
        let errorDetail: ErrorDetail;

        const res = await fetch(`/api/channels?workspaceId=${workspaceId}`);
        const data: GetChannelListApiResponse = await res.json();

        errorDetail = ErrorDetail.getFromJson(data.errorDetail);
        if (!errorDetail.success) {
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
            return;
        }

        const channels = data.channels;
        if (channels.length <= 0) {
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
            return;
        }

        return channels[0];
    };

    return (
        <>
            {workspaces.map((workspace) => {
                const isIncluded = currentPath.includes(`${basePath}/${workspace.workspaceId}`);
                return (
                    <Tooltip key={workspace.workspaceId} title={workspace.workspaceName}>
                        <ListItem
                            className={`
                                ${pageStyles.selected}
                                ${workspaceStyles.workspaceItem}
                                ${isIncluded ? workspaceStyles.active : ""}
                            `}
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
                            sx={{ pl: 1 }}
                            disablePadding
                        >
                            <ListItemButton>
                                <ListItemAvatar>
                                    <Avatar sx={{ padding: "5px" }}>
                                        {workspace.workspaceName.at(0)}
                                    </Avatar>
                                </ListItemAvatar>
                            </ListItemButton>
                        </ListItem>
                    </Tooltip>
                );
            })}
        </>
    );
};

export default WorkspaceList;
