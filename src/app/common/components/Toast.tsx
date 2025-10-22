import { Alert, AlertColor, Snackbar, SnackbarCloseReason, SnackbarOrigin } from "@mui/material";
import React from "react";

type ToastProps = {
    msg: string;
    severity: AlertColor;
    open: boolean;
    onClose: (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => void;
    autoHideDuration?: number;
    anchorOrigin?: SnackbarOrigin;
};

/**
 * Toastコンポーネントを返す。デフォルトでは画面右下に表示され、6秒後に消える
 * @param msg Toastで表示するメッセージ
 * @param severity Toastの重要度
 * @param open 開閉制御用フラグ
 * @param onClose 閉じる際のコールバック
 * @param autoHideDuration 自動的に閉じるまでの秒数(ms)
 * @param anchorOrigin 表示するポジション
 */
const Toast = ({
    msg,
    severity,
    open,
    onClose,
    autoHideDuration = 6000,
    anchorOrigin = { horizontal: "right", vertical: "bottom" },
}: ToastProps) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            anchorOrigin={anchorOrigin}
        >
            <Alert severity={severity} onClose={onClose}>
                {msg}
            </Alert>
        </Snackbar>
    );
};

export default Toast;
