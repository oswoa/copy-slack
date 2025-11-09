"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Box, Container, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";

import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { ERROR_CODES } from "@/app/contants/errorCodes";

import Toast from "@/app/common/components/Toast";
import { ErrorDetail } from "@/app/common/ErrorDetail";

import { LoginApiRequest, LoginApiResponse } from "@/app/api/login/route";
import { GetWorkspaceListApiResponse } from "@/app/api/workspaces/route";

import { useCurrentUserUpdate } from "@/app/context/CurrentUserContext";
import { GetChannelListApiResponse } from "@/app/api/channels/route";

// バリデーションスキーマ
const formSchema = z.object({
    userId: z
        .string()
        .min(3, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_USER_ID_MIN_LENGTH(3))
        .max(20, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_USER_ID_MAX_LENGTH(20)),
    password: z
        .string()
        .min(8, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_PASSWROD_MIN_LENGTH(8))
        .max(20, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_PASSWORD_MAX_LENGTH(20)),
});
type formInput = z.infer<typeof formSchema>;

export const LoginComponent = () => {
    const router = useRouter();
    const currentUserUpdate = useCurrentUserUpdate();

    const [toastOpen, setToastOpen] = useState(false);
    const [toastErrMsg, setToastErrMsg] = useState("");

    const login = async (formData: formInput) => {
        let errorDetail: ErrorDetail;

        try {
            // ログイン処理
            const req: LoginApiRequest = {
                userId: formData.userId,
                password: formData.password,
            };
            const loginResponse = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...req }),
            });
            const loginData: LoginApiResponse = await loginResponse.json();

            errorDetail = ErrorDetail.getFromJson(loginData.errorDetail);
            if (!errorDetail.success) {
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const loginedUser = loginData.user;
            if (!loginedUser) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            // 自分が所属するワークスペースの取得
            const workspacesResponse = await fetch(`/api/workspaces?ownerId=${loginedUser.userId}`);
            const workspacesData: GetWorkspaceListApiResponse = await workspacesResponse.json();

            errorDetail = ErrorDetail.getFromJson(workspacesData.errorDetail);
            if (!errorDetail.success) {
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const workspaces = workspacesData.workspaces;
            if (workspaces.length <= 0) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            // firstWorkspaceのチャネルを取得
            const firstWorkspace = workspaces[0];
            const channelsResponse = await fetch(
                `/api/channels?workspaceId=${firstWorkspace.workspaceId}`
            );
            const channelsData: GetChannelListApiResponse = await channelsResponse.json();

            errorDetail = ErrorDetail.getFromJson(channelsData.errorDetail);
            if (!errorDetail.success) {
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const channels = channelsData.channels;
            if (channels.length <= 0) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }
            const targetChannel = channels[0];

            currentUserUpdate(loginedUser);
            router.push(`/workspace/${firstWorkspace.workspaceId}/${targetChannel.channelId}`);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
        }
    };

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
    } = useForm<formInput>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            userId: "",
            password: "",
        },
    });

    return (
        <>
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ mt: "40%", padding: "70px", maxHeight: "400px" }}>
                    <Typography variant="h1" fontSize={"42px"} textAlign="center" paddingBottom={5}>
                        Copy Slack
                    </Typography>

                    <Box component={"form"} onSubmit={handleSubmit(login)}>
                        <Stack spacing={3}>
                            <TextField
                                required
                                type="text"
                                id="userId"
                                label="ユーザID"
                                {...register("userId")}
                                helperText={errors.userId?.message}
                                error={errors.userId != null}
                            />

                            <TextField
                                required
                                type="password"
                                id="password"
                                label="パスワード"
                                autoComplete="current-password"
                                {...register("password")}
                                helperText={errors.password?.message}
                                error={errors.password != null}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!isValid || isSubmitting}
                            >
                                ログイン
                            </Button>
                        </Stack>
                    </Box>

                    <Typography fontSize={"16px"} textAlign="center" marginTop={3}>
                        登録は<Link href="/signup">こちら</Link>から
                    </Typography>
                </Paper>
            </Container>
            <Toast msg={toastErrMsg} severity={"error"} open={toastOpen} setOpen={setToastOpen} />;
        </>
    );
};

export default LoginComponent;
