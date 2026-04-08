"use client";

import { usePathname, useRouter } from "next/navigation";
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
};

const WorkspaceList = ({ workspaces }: ListProps) => {
    const basePath = "/workspace";
    const currentPath = usePathname();
    const router = useRouter();

    const { setOpenErrToast, setErrToastMsg } = useErrToast();

    const getGeneralChannel = async (workspaceId: string) => {
        let errorDetail: ErrorDetail;

        const res = await fetch(`/api/channels?workspaceId=${workspaceId}`);
        const data: GetChannelListApiResponse = await res.json();

        errorDetail = ErrorDetail.getFromJson(data.errorDetail);
        if (!errorDetail.success) {
            setOpenErrToast(true);
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
            setOpenErrToast(true);
            setErrToastMsg(errorDetail.errMsg);
            return;
        }

        return channels.find((channel) => channel.channelName === "general");
    };

    return (
        <>
            {workspaces.map((workspace) => {
                const isIncluded = currentPath.includes(workspace.workspaceId);
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

                                const generalChannel = await getGeneralChannel(
                                    workspace.workspaceId,
                                );
                                if (generalChannel) {
                                    const dstPath = `${basePath}/${workspace.workspaceId}/${generalChannel.channelId}`;
                                    router.push(dstPath);
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
