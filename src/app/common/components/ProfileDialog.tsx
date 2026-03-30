"use client";

import { ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
    Dialog,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Stack,
    Box,
    IconButton,
    Avatar,
    Typography,
} from "@mui/material";

import { ErrorDetail } from "../ErrorDetail";

import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { UPLOAD_PATH } from "@/app/constants/profile";

import { UpdateUserApiRequest, UpdateUserApiResponse } from "@/app/api/users/[userId]/route";
import { LogoutApiResponse } from "@/app/api/logout/route";

import { useErrToast } from "@/app/context/ToastContext";
import { getSocket } from "@/app/constants/socket";
import { User } from "@/model/User";
import { HttpStatusCode } from "axios";
import { UpdateProfileApiResponse } from "@/app/api/users/[userId]/profile/route";

// バリデーションスキーマ
const formSchema = z.object({
    displayName: z
        .string()
        .min(3, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_COMMON_TEXT_MIN_LENGTH(3))
        .max(20, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_COMMON_TEXT_MAX_LENGTH(20)),
    email: z.email(ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_INCORRECT_EMAIL),
});
export type ProfileDialogText = z.infer<typeof formSchema>;

export type ProfileDialogProps = {
    open: boolean;
    user: User;
    updateUser: (user: User) => void;
    imageUrl: string;
    setImageUrl: (imageUrl: string) => void;
    onClose: () => void;
};

const ProfileDialog = ({
    open,
    user,
    updateUser,
    imageUrl,
    setImageUrl,
    onClose,
}: ProfileDialogProps) => {
    const profileForm = "profileForm";
    const socket = getSocket();
    const router = useRouter();
    const { setErrToastOpen, setErrToastMsg } = useErrToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting, isDirty },
    } = useForm<ProfileDialogText>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            displayName: user.displayName,
            email: user.email,
        },
    });

    const fileUpload = async (uploadFile: File) => {
        try {
            const formData = new FormData();
            formData.append("file", uploadFile);
            formData.append("uploadPath", UPLOAD_PATH);

            const res = await fetch(`/api/users/${user.userId}/profile`, {
                method: "PATCH",
                body: formData,
            });
            const data: UpdateProfileApiResponse = await res.json();

            const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                onClose();
                return;
            }
            setImageUrl(data.profile!.imageUrl);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
            onClose();
        }
    };

    const onAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        await fileUpload(file);
    };

    const onSubmit = async (formInput: ProfileDialogText) => {
        try {
            const formData: UpdateUserApiRequest = {
                displayName: formInput.displayName,
                email: formInput.email,
            };

            const res = await fetch(`/api/users/${user.userId}`, {
                method: "PATCH",
                body: JSON.stringify({ ...formData }),
            });
            const data: UpdateUserApiResponse = await res.json();

            const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }
            updateUser(new User(data.user!.userId, data.user!.email, data.user!.displayName));
            socket.emit("change-display-name", data.user);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
        } finally {
            onClose();
        }
    };

    const onLogout = async () => {
        try {
            const res = await fetch("/api/logout", {
                method: "POST",
            });
            const data: LogoutApiResponse = await res.json();

            const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                onClose();
                return;
            }
            router.replace("/login");
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth keepMounted={false}>
            <DialogTitle>ユーザプロフィール更新</DialogTitle>

            <DialogContent>
                <Stack
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <IconButton component={"label"}>
                        <Avatar src={imageUrl} sx={{ width: 100, height: 100, borderRadius: 2 }} />
                        <input hidden type="file" accept="image/*" onChange={onAvatarChange} />
                    </IconButton>
                    <Typography fontSize={12}>※ 画像押下でプロフィール画像を更新</Typography>

                    <Box
                        component={"form"}
                        id={profileForm}
                        onSubmit={handleSubmit(onSubmit)}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "auto 1fr",
                            alignItems: "center",
                            gap: 0.5,
                        }}
                    >
                        <Box>表示名：</Box>
                        <TextField
                            type="text"
                            required
                            variant="standard"
                            {...register("displayName")}
                            helperText={errors.displayName?.message}
                            error={errors.displayName != null}
                        />

                        <Box>Email：</Box>
                        <TextField
                            type="email"
                            required
                            variant="standard"
                            {...register("email")}
                            helperText={errors.email?.message}
                            error={errors.email != null}
                        />
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Stack
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <Box>
                        <Button variant="contained" onClick={onLogout}>
                            ログアウト
                        </Button>
                    </Box>

                    <Box>
                        <Button onClick={onClose}>キャンセル</Button>
                        <Button
                            type="submit"
                            form={profileForm}
                            disabled={!(isValid && isDirty) || isSubmitting}
                        >
                            更新
                        </Button>
                    </Box>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default ProfileDialog;
