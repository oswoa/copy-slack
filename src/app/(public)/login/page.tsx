"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Box, Container, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";

import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { ERROR_CODES } from "@/app/constants/errorCodes";

import { ErrorDetail } from "@/app/common/ErrorDetail";

import { LoginApiRequest, LoginApiResponse } from "@/app/api/login/route";
import { useErrToast } from "@/app/context/ToastContext";
import { HttpStatusCode } from "axios";

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
    const { setErrToastOpen, setErrToastMsg } = useErrToast();

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
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            if (!loginData.user || !loginData.workspaceId || !loginData.channelId) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_SERVER_UNKNOWN,
                    ERROR_MESSAGES.ERROR_SERVER_UNKNOWN,
                    HttpStatusCode.InternalServerError,
                );
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }
            router.replace(`/workspace/${loginData.workspaceId}/${loginData.channelId}`);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
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
            password: "",
        },
    });

    return (
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
    );
};

export default LoginComponent;
