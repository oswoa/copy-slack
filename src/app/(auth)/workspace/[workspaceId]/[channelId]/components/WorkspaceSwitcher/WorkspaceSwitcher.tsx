"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Workspace } from "@prisma/client";

import {
    Avatar,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import WorkspaceList from "./WorkspaceList";

import {
    GetChannelListApiResponse,
    RegisterChannelApiRequest,
    RegisterChannelApiResponse,
} from "@/app/api/channels/route";
import {
    RegisterWorkspaceApiRequest,
    RegisterWorkspaceApiResponse,
} from "@/app/api/workspaces/route";
import { DeleteWorkspaceApiResponse } from "@/app/api/workspaces/[workspaceId]/route";

import InputDialog, { DialogFormInput } from "@/app/common/components/InputDialog";
import Toast from "@/app/common/components/Toast";
import { ErrorDetail } from "@/app/common/ErrorDetail";

import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

import { useUserWorkspaces, useUserWorkspacesUpdate } from "@/app/context/UserWorkspacesContext";

import workspaceStyles from "./WorkspaceList.module.css";
import pageStyles from "../../page.module.css";
import Menu from "@/app/common/components/Menu";
import ConfirmDialog from "@/app/common/components/ConfirmDialog";
import Tooltip from "@/app/common/components/Tooltip";
import { RegisterWorkspaceUserApiResponse } from "@/app/api/workspaces/[workspaceId]/[userId]/route";

type WorkspaceSwitcherProps = {
    currentUser: Omit<User, "password" | "token">;
    workspaceId: string;
};

const WorkspaceSwitcher = ({ currentUser, workspaceId }: WorkspaceSwitcherProps) => {
    const router = useRouter();
    const userWorkspaces = useUserWorkspaces();
    const currentWorkspace = userWorkspaces.find(
        (workspace) => workspace.workspaceId === workspaceId
    );
    const userWorkspacesUpdate = useUserWorkspacesUpdate();

    const [toastOpen, setToastOpen] = useState(false);
    const [toastErrMsg, setToastErrMsg] = useState("");

    const [menuAnchorEl, setAenuAnchorEl] = useState<HTMLElement | null>(null);
    const openMenu = Boolean(menuAnchorEl);

    const [openInputDialog, setOpenInputDialog] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [collapseExtended, setCollapseExtended] = useState(false);
    const [isDeletable, setIsDeletable] = useState(false);

    // 表示するワークスペースの数に制限を掛け、Collapseで畳む
    const maxNotCollapsedWorkspaces = 5;
    let notCollapsedWorkspaces: Workspace[] = [];
    let collapsedWorkspaces: Workspace[] = [];

    if (maxNotCollapsedWorkspaces < userWorkspaces.length) {
        notCollapsedWorkspaces = userWorkspaces.slice(0, maxNotCollapsedWorkspaces);
        collapsedWorkspaces = userWorkspaces.slice(maxNotCollapsedWorkspaces);
    } else {
        notCollapsedWorkspaces = userWorkspaces;
    }

    const handleListOnClick = (srcPath: string, dstPath: string) => {
        if (srcPath.includes(dstPath)) {
            return;
        }
        router.push(dstPath);
    };

    const onInputDialogOpen = () => setOpenInputDialog(true);
    const onInputDialogClose = () => setOpenInputDialog(false);
    const onInputDialogSubmit = async (dialogFormInput: DialogFormInput) => {
        let errorDetail: ErrorDetail;

        try {
            // ワークスペース登録
            const registerWorkspaceName = dialogFormInput.text || "workspace name";
            const registerWorkspaceReq: RegisterWorkspaceApiRequest = {
                userId: currentUser.userId,
                workspaceName: registerWorkspaceName,
            };
            const registerWorkspaceRes = await fetch("/api/workspaces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...registerWorkspaceReq }),
            });
            const workspaceData: RegisterWorkspaceApiResponse = await registerWorkspaceRes.json();

            errorDetail = ErrorDetail.getFromJson(workspaceData.errorDetail);
            if (!errorDetail.success) {
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const createdWorkspace = workspaceData.workspace;
            if (!createdWorkspace) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            // 中間テーブルの登録
            const registerWorkspaceUserRes = await fetch(
                `/api/workspaces/${createdWorkspace.workspaceId}/${currentUser.userId}`,
                { method: "POST" }
            );
            const workspaceUserData: RegisterWorkspaceUserApiResponse =
                await registerWorkspaceUserRes.json();

            errorDetail = ErrorDetail.getFromJson(workspaceUserData.errorDetail);
            if (!errorDetail.success) {
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            // チャネル登録
            const registerChannelReq: RegisterChannelApiRequest = {
                workspaceId: createdWorkspace.workspaceId,
            };
            const registerChannelRes = await fetch("/api/channels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...registerChannelReq }),
            });
            const channelData: RegisterChannelApiResponse = await registerChannelRes.json();

            errorDetail = ErrorDetail.getFromJson(channelData.errorDetail);
            if (!errorDetail.success) {
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const createdChannel = channelData.channel;
            if (!createdChannel) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            userWorkspacesUpdate([...userWorkspaces, createdWorkspace]);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
        } finally {
            onInputDialogClose();
        }
    };

    const handleMenuIconOnClick = (e: HTMLElement) => {
        setAenuAnchorEl(e);
    };

    const handleMenuOnClick = async () => {
        setOpenConfirmDialog(true);
    };

    const onDelete = async () => {
        let errorDetail: ErrorDetail;

        try {
            // ワークスペース削除
            const deleteRes = await fetch(`/api/workspaces/${workspaceId}`, {
                method: "DELETE",
            });
            const deleteData: DeleteWorkspaceApiResponse = await deleteRes.json();

            errorDetail = ErrorDetail.getFromJson(deleteData.errorDetail);
            if (!errorDetail.success) {
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const deletedWorkspace = deleteData.workspace;
            if (!deletedWorkspace) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const filteredExistWorkspaceList = userWorkspaces.filter(
                (workspace) => workspace.workspaceId !== deletedWorkspace.workspaceId
            );
            if (filteredExistWorkspaceList.length <= 0) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }
            userWorkspacesUpdate(filteredExistWorkspaceList);

            // 遷移先のワークスペースに所属するチャネル一覧を取得
            const dstWorkspace = filteredExistWorkspaceList[0];
            const fetchRes = await fetch(`/api/channels?workspaceId=${dstWorkspace.workspaceId}`);
            const fetchData: GetChannelListApiResponse = await fetchRes.json();

            errorDetail = ErrorDetail.getFromJson(fetchData.errorDetail);
            if (!errorDetail.success) {
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const channelList = fetchData.channels;
            if (channelList.length <= 0) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const dstChannel = channelList[0];
            const dstPath = `/workspace/${dstWorkspace.workspaceId}/${dstChannel.channelId}`;
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

    const confirmWorkspaceDeletetable = () => {
        if (userWorkspaces.length === 1) {
            return false;
        }

        if (currentWorkspace!.ownerId !== currentUser.userId) {
            return false;
        }

        return true;
    };

    useEffect(() => {
        if (userWorkspaces.length <= 0) {
            return;
        }
        const result = confirmWorkspaceDeletetable();
        setIsDeletable(result);
    }, [userWorkspaces]);

    return (
        <>
            <List disablePadding>
                <WorkspaceList workspaces={notCollapsedWorkspaces} onClick={handleListOnClick} />

                {0 < collapsedWorkspaces.length ? (
                    <>
                        <IconButton
                            color={"info"}
                            onClick={() => setCollapseExtended(!collapseExtended)}
                            sx={{ width: "80%" }}
                        >
                            <ExpandMoreIcon
                                sx={{
                                    transform: collapseExtended ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 0.3s ease",
                                }}
                            />
                        </IconButton>
                        <Collapse in={collapseExtended} unmountOnExit>
                            <WorkspaceList
                                workspaces={collapsedWorkspaces}
                                onClick={handleListOnClick}
                            />
                        </Collapse>
                    </>
                ) : null}

                {/* ワークスペース追加ボタン */}
                <Tooltip key={"addWorkspaceButton"} title={"ワークスペースを作成する"}>
                    <ListItem
                        className={`
                            ${pageStyles.selected}
                            ${workspaceStyles.workspaceItem}
                        `}
                        onClick={onInputDialogOpen}
                        disablePadding
                        sx={{ pl: 1 }}
                    >
                        <ListItemButton>
                            <ListItemAvatar>
                                <Avatar sx={{ padding: "3px" }}>
                                    <AddIcon color={"action"} />
                                </Avatar>
                            </ListItemAvatar>
                        </ListItemButton>
                    </ListItem>
                </Tooltip>

                {/* その他ボタン */}
                {isDeletable ? (
                    <Tooltip key={"etc"} title={"その他"}>
                        <ListItem
                            className={workspaceStyles.workspaceItem}
                            disablePadding
                            sx={{ justifyContent: "center" }}
                        >
                            <IconButton
                                onClick={(e) => handleMenuIconOnClick(e.currentTarget)}
                                className={pageStyles.menuIcon}
                            >
                                <MoreVertIcon fontSize="large" />
                            </IconButton>
                        </ListItem>
                    </Tooltip>
                ) : null}
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
                        // TODO: ワークスペース名の変更処理を追加
                    ]}
                    onClose={() => setAenuAnchorEl(null)}
                />
            )}
            <InputDialog
                open={openInputDialog}
                title={"新規作成"}
                content={"ワークスペース名を入力して下さい"}
                label={"ワークスペース名"}
                btnText={"作成"}
                onSubmit={onInputDialogSubmit}
                onClose={onInputDialogClose}
            />
            <ConfirmDialog
                open={openConfirmDialog}
                title={"確認"}
                content={"現在のワークスペースを削除しますか?"}
                onAgree={onDelete}
                onClose={() => setOpenConfirmDialog(false)}
            />
            <Toast msg={toastErrMsg} severity={"error"} open={toastOpen} setOpen={setToastOpen} />;
        </>
    );
};

export default WorkspaceSwitcher;
