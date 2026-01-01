"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Box, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";

import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { ERROR_CODES } from "@/app/constants/errorCodes";

import { ErrorDetail } from "@/app/common/ErrorDetail";

import { RegisterChannelApiRequest, RegisterChannelApiResponse } from "@/app/api/channels/route";
import { RegisterUserApiRequest, RegisterUserApiResponse } from "@/app/api/users/route";
import {
    RegisterWorkspaceApiRequest,
    RegisterWorkspaceApiResponse,
} from "@/app/api/workspaces/route";
import { RegisterWorkspaceUserApiResponse } from "@/app/api/workspaces/[workspaceId]/[userId]/route";
import { RegisterUserProfileApiResponse } from "@/app/api/users/[userId]/profile/route";

import { useErrToast } from "@/app/context/ToastContext";

// バリデーションスキーマ
const formSchema = z.object({
    userId: z
        .string()
        .min(3, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_USER_ID_MIN_LENGTH(3))
        .max(20, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_USER_ID_MAX_LENGTH(20)),
    email: z.email(ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_INCORRECT_EMAIL),
    password: z
        .string()
        .min(8, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_PASSWROD_MIN_LENGTH(8))
        .max(20, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_PASSWORD_MAX_LENGTH(20)),
});
type formInput = z.infer<typeof formSchema>;

export const SignupComponent = () => {
    const router = useRouter();
    const { setErrToastOpen, setErrToastMsg } = useErrToast();

    const signup = async (data: formInput) => {
        let errorDetail: ErrorDetail;

        try {
            // ユーザ登録
            const registerUserReq: RegisterUserApiRequest = {
                userId: data.userId,
                email: data.email,
                password: data.password,
            };
            const registerUserRes = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...registerUserReq }),
            });
            const userData: RegisterUserApiResponse = await registerUserRes.json();

            errorDetail = ErrorDetail.getFromJson(userData.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const signupUser = userData.user;
            if (!signupUser) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            // ワークスペース登録
            const registerWorkspaceReq: RegisterWorkspaceApiRequest = {
                userId: registerUserReq.userId,
            };
            const registerWorkspaceRes = await fetch("/api/workspaces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...registerWorkspaceReq }),
            });
            const workspaceData: RegisterWorkspaceApiResponse = await registerWorkspaceRes.json();

            errorDetail = ErrorDetail.getFromJson(workspaceData.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const targetWorkspace = workspaceData.workspace;
            if (!targetWorkspace) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            // 中間テーブルの登録
            const registerWorkspaceUserRes = await fetch(
                `/api/workspaces/${targetWorkspace.workspaceId}/${signupUser.userId}`,
                { method: "POST" }
            );
            const workspaceUserData: RegisterWorkspaceUserApiResponse =
                await registerWorkspaceUserRes.json();

            errorDetail = ErrorDetail.getFromJson(workspaceUserData.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            // チャネル登録
            const registerChannelReq: RegisterChannelApiRequest = {
                workspaceId: targetWorkspace.workspaceId,
            };
            const registerChannelRes = await fetch(`/api/channels`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...registerChannelReq }),
            });
            const channelData: RegisterChannelApiResponse = await registerChannelRes.json();

            errorDetail = ErrorDetail.getFromJson(channelData.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const targetChannel = channelData.channel;
            if (!targetChannel) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            // プロフィール画像はnull状態で登録
            const registerUserProfileRes = await fetch(`/api/users/${signupUser.userId}/profile`, {
                method: "POST",
                body: new FormData(),
            });
            const userProfileData: RegisterUserProfileApiResponse =
                await registerUserProfileRes.json();

            errorDetail = ErrorDetail.getFromJson(userProfileData.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }
            router.replace(`/workspace/${targetWorkspace.workspaceId}/${targetChannel.channelId}`);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
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
            email: "",
            password: "",
        },
    });

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ mt: "40%", padding: "70px", maxHeight: "450px" }}>
                <Typography variant="h1" fontSize={"42px"} textAlign="center" paddingBottom={5}>
                    ユーザ登録
                </Typography>

                <Box component={"form"} onSubmit={handleSubmit(signup)}>
                    <Stack spacing={3}>
                        <TextField
                            required
                            type="text"
                            id="id"
                            label="ユーザID"
                            {...register("userId")}
                            helperText={errors.userId?.message}
                            error={errors.userId != null}
                        />

                        <TextField
                            required
                            type="email"
                            id="email"
                            label="メールアドレス"
                            autoComplete="email"
                            {...register("email")}
                            helperText={errors.email?.message}
                            error={errors.email != null}
                        />

                        <TextField
                            required
                            type="password"
                            id="password"
                            label="パスワード"
                            autoComplete="new-password"
                            {...register("password")}
                            helperText={errors.password?.message}
                            error={errors.password != null}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={!isValid || isSubmitting}
                        >
                            登録
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
};

export default SignupComponent;
