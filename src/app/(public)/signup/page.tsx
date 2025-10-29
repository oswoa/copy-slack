"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { uuidv7 } from "uuidv7";

import { Container, Paper, Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";

import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import Toast from "@/app/common/components/Toast";
import { useState } from "react";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { HttpStatusCode } from "axios";
import { User } from "@/app/common/User";
import { RegisterUserApiResponse } from "@/app/api/users/route";
import { RegisterWorkspaceApiResponse } from "@/app/api/workspaces/route";

let cacheRefineId: string = "";

// バリデーションスキーマ
const formSchema = z.object({
    id: z
        .string()
        .min(3, ERROR_MESSAGES.ERROR_VALIDATION_USER_ID_MIN_LENGTH(3))
        .max(20, ERROR_MESSAGES.ERROR_VALIDATION_USER_ID_MAX_LENGTH(20))
        .refine(
            async (id) => {
                if (id === cacheRefineId || id === "") {
                    return true;
                }
                //* 無駄にAPIを叩くのを抑制する。resolver経由だとid以外の項目を触っただけで走る
                cacheRefineId = id;

                // ユーザ照会
                const res = await fetch(`/api/users/${id}`);
                const data = await res.json();
                const user = User.getFromJson(data.user);
                return user ? false : true;
            },
            { error: ERROR_MESSAGES.ERROR_VALIDATION_USER_ID_ALREADY_USED() }
        ),
    email: z.email(ERROR_MESSAGES.ERROR_VALIDATION_INCORRECT_EMAIL()),
    password: z
        .string()
        .min(8, ERROR_MESSAGES.ERROR_VALIDATION_PASSWROD_MIN_LENGTH(8))
        .max(20, ERROR_MESSAGES.ERROR_VALIDATION_PASSWORD_MAX_LENGTH(20)),
});
export type formInput = z.infer<typeof formSchema>;

export const Signup = () => {
    const router = useRouter();
    const [toastOpen, setToastOpen] = useState(false);
    const [toastErrMsg, setToastErrMsg] = useState("");

    const signup = async (formData: formInput) => {
        try {
            // ユーザ登録
            const token = uuidv7();
            const userRegisterRes = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, token }),
            });
            const userData: RegisterUserApiResponse = await userRegisterRes.json();

            if (userRegisterRes.status !== HttpStatusCode.Created) {
                let errorDetail = ErrorDetail.getFromJson(userData.errorDetail);
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
            const signupUser = User.getFromJson(userData.user);
            if (!signupUser) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN()
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            // ワークスペース登録
            const workspaceRegisterRes = await fetch("/api/workspaces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workspaceId: uuidv7(),
                    userId: signupUser.id,
                    workspaceName: signupUser.id,
                    channels: ["#general"],
                }),
            });
            const workspaceData: RegisterWorkspaceApiResponse = await workspaceRegisterRes.json();

            if (workspaceRegisterRes.status !== HttpStatusCode.Created) {
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

            const targetWorkspace = workspaceData.workspace;
            if (!targetWorkspace) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_SERVER_FAILED_REGISTER_WORKSPACE,
                    ERROR_MESSAGES.ERROR_SERVER_FAILED_REGISTER_WORKSPACE()
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            router.push(`/workspace/${targetWorkspace.workspaceId}`);
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
            email: "",
            password: "",
        },
    });

    return (
        <>
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ mt: "40%", padding: "70px", maxHeight: "450px" }}>
                    <Typography variant="h1" fontSize={"42px"} textAlign="center" paddingBottom={5}>
                        ユーザ登録
                    </Typography>

                    <form onSubmit={handleSubmit(signup)}>
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
                    </form>
                </Paper>
            </Container>
            <Toast msg={toastErrMsg} severity={"error"} open={toastOpen} setOpen={setToastOpen} />;
        </>
    );
};

export default Signup;
