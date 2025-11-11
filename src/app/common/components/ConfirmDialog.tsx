"use client";

import {
    Dialog,
    Button,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

export type DialogProps = {
    open: boolean;
    title: string;
    content: string;
    onAgree: () => void;
    onClose: () => void;
};

const ConfirmDialog = ({ open, title, content, onAgree, onClose }: DialogProps) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth keepMounted={false}>
            <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
                <InfoIcon color="primary" sx={{ pr: 1 }} />
                {title}
            </DialogTitle>

            <DialogContent>
                <DialogContentText>{content}</DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>キャンセル</Button>
                <Button onClick={onAgree}>はい</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
