"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { HttpStatusCode } from "axios";

import { Container, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";

import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

// バリデーションスキーマ
const formSchema = z.object({
    id: z
        .string()
        .min(3, ERROR_MESSAGES.ERROR_VALIDATION_USER_ID_MIN_LENGTH(3))
        .max(20, ERROR_MESSAGES.ERROR_VALIDATION_USER_ID_MAX_LENGTH(20)),
    password: z
        .string()
        .min(8, ERROR_MESSAGES.ERROR_VALIDATION_PASSWROD_MIN_LENGTH(8))
        .max(20, ERROR_MESSAGES.ERROR_VALIDATION_PASSWORD_MAX_LENGTH(20)),
});
export type formInput = z.infer<typeof formSchema>;

export const Login = () => {
    const router = useRouter();

    const login = async (formData: formInput) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, token }),
            });

            if (res.status === HttpStatusCode.Ok) {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error(ERROR_MESSAGES.ERROR_UNKNOWN(), error);
        }
        // TODO: グローバルエラーをToastで表示するようにすること
    };

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
    } = useForm<formInput>({
        resolver: zodResolver(formSchema),
        mode: "onSubmit",
        defaultValues: {
            id: "",
            password: "",
        },
    });

    return (
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
    );
};

export default Login;
