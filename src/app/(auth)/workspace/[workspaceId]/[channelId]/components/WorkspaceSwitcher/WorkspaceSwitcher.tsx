"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

import { GetChannelListApiResponse } from "@/app/api/channels/route";
import {
    RegisterWorkspaceApiRequest,
    RegisterWorkspaceApiResponse,
} from "@/app/api/workspaces/route";
import { DeleteWorkspaceApiResponse } from "@/app/api/workspaces/[workspaceId]/route";

import InputDialog, { InputDialogText } from "@/app/common/components/InputDialog";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import Menu from "@/app/common/components/Menu";
import ConfirmDialog from "@/app/common/components/ConfirmDialog";
import Tooltip from "@/app/common/components/Tooltip";
import { SuccessDetail } from "@/app/common/SuccessDetail";

import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { getSocket } from "@/app/lib/socket";
import { SUCCESS_CODES } from "@/app/constants/successCode";
import { SUCCESS_MESSAGES } from "@/app/constants/successMessages";

import {
    useLoginUserWorkspaces,
    useLoginUserWorkspacesUpdate,
} from "@/app/context/LoginUserWorkspacesContext";
import { useErrToast, useSuccessToast } from "@/app/context/ToastContext";

import workspaceStyles from "./WorkspaceList.module.css";
import pageStyles from "../../page.module.css";
import { HttpStatusCode } from "axios";
import { Workspace } from "@/model/Workspace";
import { useLoginUser } from "@/app/context/LoginUserContext";

type WorkspaceSwitcherProps = {
    currentWorkspaceId: string;
    maxNotCollapsedWorkspaceNum: number;
};

const WorkspaceSwitcher = ({
    currentWorkspaceId,
    maxNotCollapsedWorkspaceNum,
}: WorkspaceSwitcherProps) => {
    const router = useRouter();
    const loginUser = useLoginUser();
    const loginUserWorkspaces = useLoginUserWorkspaces();
    const loginUserWorkspacesUpdate = useLoginUserWorkspacesUpdate();
    const socket = getSocket();

    const { setOpenErrToast, setErrToastMsg } = useErrToast();
    const { setOpenSuccessToast, setSuccessToastMsg } = useSuccessToast();

    const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
    const openMenu = Boolean(menuAnchorEl);

    const [isDeletable, setIsDeletable] = useState(false);
    const [openCreateWorkspaceDialog, setOpenCreateWorkspaceDialog] = useState(false);
    const [openDeleteWorkspaceDialog, setOpenDeleteWorkspaceDialog] = useState(false);
    const [collapseExtended, setCollapseExtended] = useState(false);

    const handleMenuIconOnClick = (e: HTMLElement) => {
        setMenuAnchorEl(e);
    };

    const onCreateWorkspace = async (dialogFormInput: InputDialogText) => {
        let errorDetail: ErrorDetail;

        try {
            // ワークスペース登録
            const registerWorkspaceName = dialogFormInput.text || "workspace name";
            const registerWorkspaceReq: RegisterWorkspaceApiRequest = {
                userId: loginUser.userId,
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
                setOpenErrToast(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const successDetail = new SuccessDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_CREATED_WORKSPACE,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_CREATED_WORKSPACE,
            );
            setOpenSuccessToast(true);
            setSuccessToastMsg(successDetail.msg);
            loginUserWorkspacesUpdate([
                ...loginUserWorkspaces,
                new Workspace(
                    workspaceData.workspace!.workspaceId,
                    workspaceData.workspace!.ownerId,
                    workspaceData.workspace!.workspaceName,
                ),
            ]);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setOpenErrToast(true);
            setErrToastMsg(errorDetail.errMsg);
        } finally {
            setOpenCreateWorkspaceDialog(false);
        }
    };

    const onDeleteWorkspace = async () => {
        let errorDetail: ErrorDetail;

        try {
            // ワークスペース削除
            const deleteRes = await fetch(`/api/workspaces/${currentWorkspaceId}`, {
                method: "DELETE",
            });
            const workspaceResponse: DeleteWorkspaceApiResponse = await deleteRes.json();
            errorDetail = ErrorDetail.getFromJson(workspaceResponse.errorDetail);
            if (!errorDetail.success) {
                setOpenErrToast(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const deletedWorkspace = new Workspace(
                workspaceResponse.workspace!.workspaceId,
                workspaceResponse.workspace!.ownerId,
                workspaceResponse.workspace!.workspaceName,
            );

            const existWorkspaceList = loginUserWorkspaces.filter(
                (workspace) => workspace.workspaceId !== deletedWorkspace.workspaceId,
            );
            if (existWorkspaceList.length <= 0) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                    HttpStatusCode.BadRequest,
                );
                setOpenErrToast(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }
            loginUserWorkspacesUpdate(existWorkspaceList);

            // ワークスペース削除をトリガーに遷移を発生させるため、チャネルを取得する
            const dstWorkspace = existWorkspaceList[0];
            const fetchRes = await fetch(`/api/channels?workspaceId=${dstWorkspace.workspaceId}`);
            const channelsResponse: GetChannelListApiResponse = await fetchRes.json();
            errorDetail = ErrorDetail.getFromJson(channelsResponse.errorDetail);
            if (!errorDetail.success) {
                setOpenErrToast(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const successDetail = new SuccessDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_DELETED_WORKSPACE,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_DELETED_WORKSPACE,
            );
            setOpenSuccessToast(true);
            setSuccessToastMsg(successDetail.msg);

            const generalChannel = channelsResponse.channels.find(
                (channel) => channel.channelName === "general",
            );
            const dstPath = `/workspace/${dstWorkspace.workspaceId}/${generalChannel!.channelId}`;
            socket.emit("delete-workspace", deletedWorkspace);
            router.replace(dstPath);
        } catch (_) {
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setOpenErrToast(true);
            setErrToastMsg(errorDetail.errMsg);
            return;
        }
    };

    const confirmCurrentWorkspaceIsDeletable = (currentWorkspace: Workspace) => {
        if (loginUserWorkspaces.length === 1) {
            return false;
        }
        if (currentWorkspace?.ownerId !== loginUser.userId) {
            return false;
        }
        return true;
    };

    useEffect(() => {
        // 現在のワークスペースが削除可能か確認する
        const currentWorkspace = loginUserWorkspaces.find(
            (workspace) => workspace.workspaceId === currentWorkspaceId,
        );
        if (!currentWorkspace) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setOpenErrToast(true);
            setErrToastMsg(errorDetail.errMsg);
            return;
        }

        const isDeletable = confirmCurrentWorkspaceIsDeletable(currentWorkspace);
        setIsDeletable(isDeletable);
    }, []);

    // 表示するワークスペースの数に制限を掛け、Collapseで畳む
    let notCollapsedWorkspaces: Workspace[] = [];
    let collapsedWorkspaces: Workspace[] = [];
    if (maxNotCollapsedWorkspaceNum < loginUserWorkspaces.length) {
        notCollapsedWorkspaces = loginUserWorkspaces.slice(0, maxNotCollapsedWorkspaceNum);
        collapsedWorkspaces = loginUserWorkspaces.slice(maxNotCollapsedWorkspaceNum);
    } else {
        notCollapsedWorkspaces = loginUserWorkspaces;
    }

    return (
        <>
            <List disablePadding>
                <WorkspaceList workspaces={notCollapsedWorkspaces} />

                {0 < collapsedWorkspaces.length && (
                    <>
                        <IconButton
                            color={"info"}
                            onClick={() => setCollapseExtended(!collapseExtended)}
                            sx={{ width: "100%" }}
                        >
                            <ExpandMoreIcon
                                sx={{
                                    transform: collapseExtended ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 0.3s ease",
                                }}
                            />
                        </IconButton>

                        <Collapse in={collapseExtended} unmountOnExit>
                            <WorkspaceList workspaces={collapsedWorkspaces} />
                        </Collapse>
                    </>
                )}

                {/* ワークスペース追加ボタン */}
                <Tooltip key={"addWorkspaceButton"} title={"ワークスペースを作成する"}>
                    <ListItem
                        className={`
                            ${pageStyles.selected}
                            ${workspaceStyles.workspaceItem}
                        `}
                        onClick={() => setOpenCreateWorkspaceDialog(true)}
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
                {isDeletable && (
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
                )}
            </List>
            {openMenu && (
                <Menu
                    open={openMenu}
                    anchorEl={menuAnchorEl}
                    actions={[
                        {
                            label: "削除",
                            fire: () => setOpenDeleteWorkspaceDialog(true),
                        },
                        // TODO: ワークスペース名の変更処理を追加
                    ]}
                    onClose={() => setMenuAnchorEl(null)}
                />
            )}
            {openCreateWorkspaceDialog && (
                <InputDialog
                    open={openCreateWorkspaceDialog}
                    title={"新規作成"}
                    content={"ワークスペース名を入力して下さい"}
                    label={"ワークスペース名"}
                    btnText={"作成"}
                    onSubmit={onCreateWorkspace}
                    onClose={() => setOpenCreateWorkspaceDialog(false)}
                />
            )}
            {openDeleteWorkspaceDialog && (
                <ConfirmDialog
                    open={openDeleteWorkspaceDialog}
                    title={"確認"}
                    content={"現在のワークスペースを削除しますか?"}
                    onAgree={onDeleteWorkspace}
                    onClose={() => setOpenDeleteWorkspaceDialog(false)}
                />
            )}
        </>
    );
};

export default WorkspaceSwitcher;
