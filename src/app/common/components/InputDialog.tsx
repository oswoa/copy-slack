"use client";

import {
    Dialog,
    Button,
    TextField,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Box,
} from "@mui/material";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { zodResolver } from "@hookform/resolvers/zod";

// バリデーションスキーマ
const formSchema = z.object({
    text: z
        .string()
        .min(3, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_COMMON_TEXT_MIN_LENGTH(3))
        .max(20, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_COMMON_TEXT_MAX_LENGTH(20)),
});
export type DialogFormInput = z.infer<typeof formSchema>;

export type DialogProps = {
    open: boolean;
    title: string;
    content: string;
    label: string;
    btnText: string;
    onSubmit: (dialogFormInput: DialogFormInput) => Promise<void>;
    onClose: () => void;
};

const InputDialog = ({ open, title, content, label, btnText, onSubmit, onClose }: DialogProps) => {
    const formId = "dialog-form";

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
    } = useForm<DialogFormInput>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            text: "",
        },
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth keepMounted={false}>
            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                <DialogContentText>{content}</DialogContentText>
                <Box component={"form"} onSubmit={handleSubmit(onSubmit)} id={formId}>
                    <TextField
                        type="text"
                        required
                        id="text"
                        label={label}
                        margin="normal"
                        fullWidth
                        variant="standard"
                        {...register("text")}
                        helperText={errors.text?.message}
                        error={errors.text != null}
                    />
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>キャンセル</Button>
                <Button type="submit" form={formId} disabled={!isValid || isSubmitting}>
                    {btnText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InputDialog;
