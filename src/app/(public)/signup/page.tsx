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

import { useErrToast } from "@/app/context/ToastContext";
import { HttpStatusCode } from "axios";
import { RegisterUserApiRequest, RegisterUserApiResponse } from "@/app/api/signup/route";
import { PageFactory } from "@/app/constants/pageUrl";

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

    const signup = async (formInput: formInput) => {
        try {
            // ユーザ登録
            const request: RegisterUserApiRequest = {
                userId: formInput.userId,
                email: formInput.email,
                password: formInput.password,
            };
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...request }),
            });
            const data: RegisterUserApiResponse = await response.json();

            const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const workspacePath = PageFactory.GetWorkspaceURL(data.workspaceId!, data.channelId!);
            router.replace(workspacePath);
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
