"use client";

import { usePathname, useRouter } from "next/navigation";
import { Channel } from "@prisma/client";

import { List, ListItem, ListItemButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import ConfirmDialog from "@/app/common/components/ConfirmDialog";
import { useEffect, useState } from "react";
import Menu from "@/app/common/components/Menu";
import { DeleteChannelApiResponse } from "@/app/api/channels/[channelId]/route";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { SuccessDetail } from "@/app/common/SuccessDetail";

import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { SUCCESS_CODES } from "@/app/constants/successCode";
import { SUCCESS_MESSAGES } from "@/app/constants/successMessages";
import { getSocket } from "@/app/constants/socket";

import { useUserWorkspaces } from "@/app/context/UserWorkspacesContext";
import { useLoginUser } from "@/app/context/LoginUserContext";
import { useErrToast, useSuccessToast } from "@/app/context/ToastContext";

import pageStyles from "../../page.module.css";
import channelStyles from "./Channels.module.css";
import { HttpStatusCode } from "axios";

type ChannelsProps = {
    workspaceId: string;
    channelList: Channel[];
    setChannelList: (channelList: Channel[]) => void;
    onClick: (srcPath: string, dstPath: string) => void;
};

const ChannelList = ({ workspaceId, channelList, setChannelList, onClick }: ChannelsProps) => {
    const basePath = "/workspace";
    const currentPath = usePathname();
    const router = useRouter();
    const loginUser = useLoginUser();
    const workspaces = useUserWorkspaces();
    const socket = getSocket();

    const { setErrToastOpen, setErrToastMsg } = useErrToast();
    const { setSuccessToastOpen, setSuccessToastMsg } = useSuccessToast();

    const [isWorkspaceOwner, setIsWorkspaceOwner] = useState(false);
    const [selectedChannelId, setChannelIdPostId] = useState<string>();
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const [menuAnchorEl, setAenuAnchorEl] = useState<HTMLElement | null>(null);
    const openMenu = Boolean(menuAnchorEl);

    const handleMenuIconOnClick = (e: HTMLElement, channelId: string) => {
        setAenuAnchorEl(e);
        setChannelIdPostId(channelId);
    };

    const handleMenuOnClick = async () => {
        setOpenConfirmDialog(true);
    };

    const onDelete = async () => {
        let errorDetail: ErrorDetail;

        try {
            const res = await fetch(`/api/channels/${selectedChannelId}`, {
                method: "DELETE",
            });
            const data: DeleteChannelApiResponse = await res.json();

            errorDetail = ErrorDetail.getFromJson(data.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const deletedChannel = data.channel;
            if (!deletedChannel) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                    HttpStatusCode.BadRequest,
                );
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const filteredChannelList = channelList.filter(
                (channel) => channel.channelId !== deletedChannel.channelId,
            );
            if (filteredChannelList.length === 0) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                    HttpStatusCode.BadRequest,
                );
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const dstChannel = filteredChannelList[0];
            const dstPath = `/workspace/${workspaceId}/${dstChannel.channelId}`;
            socket.emit("delete-channel", deletedChannel);

            const successDetail = new SuccessDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_DELETED_CHANNEL,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_DELETED_CHANNEL,
            );
            setSuccessToastOpen(true);
            setSuccessToastMsg(successDetail.msg);

            if (dstPath === currentPath) {
                setChannelList(filteredChannelList);
                return;
            }
            router.push(dstPath);
        } catch (_) {
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
            return;
        }
    };

    useEffect(() => {
        const currentWorkspace = workspaces.find(
            (workspace) => workspace.workspaceId === workspaceId,
        );
        setIsWorkspaceOwner(currentWorkspace?.ownerId === loginUser.userId);
    }, [loginUser, workspaces]);

    return (
        <>
            <List>
                {channelList?.map((channel) => {
                    const dstPath = `${basePath}/${workspaceId}/${channel.channelId}`;
                    const isSamePath = currentPath === dstPath;

                    return (
                        <ListItem
                            key={channel.channelId}
                            className={`
                                ${channelStyles.line}
                                ${pageStyles.selected}
                                ${isSamePath ? channelStyles.active : ""}
                            `}
                            sx={{
                                display: "flex",
                                height: "3rem",
                            }}
                        >
                            <ListItemButton
                                onClick={() => {
                                    onClick(currentPath, dstPath);
                                }}
                                sx={{ flex: 9.5 }}
                            >
                                # {channel.channelName}
                            </ListItemButton>

                            {channel.channelName !== "general" && isWorkspaceOwner ? (
                                <ListItemButton
                                    className={pageStyles.menuIcon}
                                    sx={{ flex: 0.5, justifyContent: "center" }}
                                    onClick={(e) => {
                                        handleMenuIconOnClick(e.currentTarget, channel.channelId);
                                    }}
                                >
                                    <MoreVertIcon />
                                </ListItemButton>
                            ) : null}
                        </ListItem>
                    );
                })}
            </List>

            {openMenu && (
                <Menu
                    open={openMenu}
                    anchorEl={menuAnchorEl}
                    actions={[
                        {
                            label: "削除",
                            fire: () => {
                                handleMenuOnClick();
                            },
                        },
                    ]}
                    onClose={() => setAenuAnchorEl(null)}
                />
            )}

            {openConfirmDialog ? (
                <ConfirmDialog
                    open={openConfirmDialog}
                    title={"確認"}
                    content={"選択したチャネルを削除しますか?"}
                    onAgree={onDelete}
                    onClose={() => setOpenConfirmDialog(false)}
                />
            ) : null}
        </>
    );
};

export default ChannelList;
