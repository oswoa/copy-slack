"use client";

import { usePathname, useRouter } from "next/navigation";
import { Channel } from "@prisma/client";

import { List, ListItem, ListItemButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import ConfirmDialog from "@/app/common/components/ConfirmDialog";
import { useState } from "react";
import Menu from "@/app/common/components/Menu";
import Toast from "@/app/common/components/Toast";
import { DeleteChannelApiResponse } from "@/app/api/channels/[channelId]/route";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

import pageStyles from "../../page.module.css";
import channelStyles from "./Channels.module.css";

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

    const [selectedChannelId, setChannelIdPostId] = useState<number>();
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastErrMsg, setToastErrMsg] = useState("");
    const [menuAnchorEl, setAenuAnchorEl] = useState<HTMLElement | null>(null);
    const openMenu = Boolean(menuAnchorEl);

    const handleMenuIconOnClick = (e: HTMLElement, channelId: number) => {
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
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const deletedChannel = data.channel;
            if (!deletedChannel) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const filteredChannelList = channelList.filter(
                (channel) => channel.channelId !== deletedChannel.channelId
            );
            if (filteredChannelList.length === 0) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const dstChannel = filteredChannelList[0];
            const dstPath = `/workspace/${workspaceId}/${dstChannel.channelId}`;
            if (dstPath === currentPath) {
                setChannelList(filteredChannelList);
                return;
            }
            router.push(dstPath);
        } catch (_) {
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
            return;
        }
    };

    return (
        <>
            <List>
                {channelList?.map((channel) => {
                    const dstPath = `${basePath}/${workspaceId}/${channel.channelId}`;
                    const isIncluded = currentPath.includes(dstPath);

                    return (
                        <ListItem
                            key={channel.channelId}
                            className={`
                                ${channelStyles.line}
                                ${pageStyles.selected}
                                ${isIncluded ? channelStyles.active : ""}
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

                            {/* generalチャネルは削除させない */}
                            {channel.channelName !== "general" ? (
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

            <ConfirmDialog
                open={openConfirmDialog}
                title={"確認"}
                content={"選択したチャネルを削除しますか?"}
                onAgree={onDelete}
                onClose={() => setOpenConfirmDialog(false)}
            />
            <Toast msg={toastErrMsg} severity={"error"} open={toastOpen} setOpen={setToastOpen} />
        </>
    );
};

export default ChannelList;
