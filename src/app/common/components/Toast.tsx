import {
    Alert,
    AlertColor,
    Slide,
    Snackbar,
    SnackbarCloseReason,
    SnackbarOrigin,
} from "@mui/material";
import React, { SyntheticEvent } from "react";

type ToastProps = {
    msg: string;
    severity: AlertColor;
    open: boolean;
    setOpen: (open: boolean) => void;
    autoHideDuration?: number;
    anchorOrigin?: SnackbarOrigin;
};

/**
 * Toastコンポーネントを返す。デフォルトでは画面右上に画面右端からスライドして表示され、6秒後に消える
 * @param msg Toastで表示するメッセージ
 * @param severity Toastの重要度
 * @param open 開閉制御用ステート
 * @param setOpen 閉じるためのステート更新用関数
 * @param autoHideDuration 自動的に閉じるまでの秒数(ms)
 * @param anchorOrigin 表示するポジション
 */
const Toast = ({
    msg,
    severity,
    open,
    setOpen,
    autoHideDuration = 6000,
    anchorOrigin = { horizontal: "right", vertical: "top" },
}: ToastProps) => {
    const onClose = (event?: SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
        // トースト以外の領域をクリックしても閉じないよう制御
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    return (
        <Slide in={open} direction={"left"} mountOnEnter unmountOnExit>
            <Snackbar
                open={open}
                autoHideDuration={autoHideDuration}
                onClose={onClose}
                anchorOrigin={anchorOrigin}
                sx={{ paddingTop: "10vh" }}
            >
                <Alert severity={severity} onClose={onClose}>
                    {msg}
                </Alert>
            </Snackbar>
        </Slide>
    );
};

export default Toast;
