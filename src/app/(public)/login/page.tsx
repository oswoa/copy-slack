"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { HttpStatusCode } from "axios";
import { useState } from "react";

import { Container, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";

import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { ERROR_CODES } from "@/app/contants/errorCodes";

import Toast from "@/app/common/components/Toast";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { User } from "@/app/common/User";
import { Workspace } from "@/app/common/Workspace";

import { LoginApiRequest, LoginApiResponse } from "@/app/api/login/route";
import { GetWorkspaceListApiResponse } from "@/app/api/workspaces/route";

import { useCurrentUserUpdate } from "@/app/context/CurrentUserContext";

// バリデーションスキーマ
const formSchema = z.object({
    id: z
        .string()
        .min(3, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_USER_ID_MIN_LENGTH(3))
        .max(20, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_USER_ID_MAX_LENGTH(20)),
    password: z
        .string()
        .min(8, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_PASSWROD_MIN_LENGTH(8))
        .max(20, ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_PASSWORD_MAX_LENGTH(20)),
});
export type formInput = z.infer<typeof formSchema>;

export const LoginComponent = () => {
    const router = useRouter();
    const currentUserUpdate = useCurrentUserUpdate();

    const [toastOpen, setToastOpen] = useState(false);
    const [toastErrMsg, setToastErrMsg] = useState("");

    const login = async (formData: formInput) => {
        try {
            const req: LoginApiRequest = {
                id: formData.id,
                password: formData.password,
            };
            // ログイン処理
            const loginResponse = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...req }),
            });
            const loginData: LoginApiResponse = await loginResponse.json();

            if (loginResponse.status !== HttpStatusCode.Ok) {
                let errorDetail = ErrorDetail.getFromJson(loginData.errorDetail);
                if (!errorDetail) {
                    errorDetail = new ErrorDetail(
                        ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                        ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN()
                    );
                }
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const loginedUser = User.getFromJson(loginData.user);
            if (!loginedUser) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN()
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            // 自分が所属するワークスペースの取得
            const workspacesResponse = await fetch(`/api/workspaces`);
            const workspaceData: GetWorkspaceListApiResponse = await workspacesResponse.json();

            if (workspacesResponse.status !== HttpStatusCode.Ok) {
                let errorDetail = ErrorDetail.getFromJson(workspaceData.errorDetail);
                if (!errorDetail) {
                    errorDetail = new ErrorDetail(
                        ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                        ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN()
                    );
                }
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const targetJson = workspaceData.workspaces?.find(
                (workspace) => workspace.userId === loginedUser.id
            );
            if (!targetJson) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_SERVER_DOESNT_EXIST_USER_WORKSPACE,
                    ERROR_MESSAGES.ERROR_SERVER_DOESNT_EXIST_USER_WORKSPACE()
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const targetWorkspace = Workspace.getFromJson(targetJson);
            if (!targetWorkspace) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN()
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            currentUserUpdate(loginedUser);
            router.push(`/workspace/${targetWorkspace.workspaceId}/general`);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN()
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
            id: "",
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

                    <form onSubmit={handleSubmit(login)}>
                        <Stack spacing={3}>
                            <TextField
                                required
                                type="text"
                                id="id"
                                label="ユーザID"
                                {...register("id")}
                                helperText={errors.id?.message}
                                error={errors.id != null}
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
                    </form>

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
