"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Container, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";

type LoginInfo = {
    userId: string;
    email: string;
    token: string;
};

// バリデーションスキーマ
const formSchema = z.object({
    userId: z
        .string()
        .min(3, "ユーザIDは3文字以上で入力してください")
        .max(15, "ユーザIDは15文字以内で入力してください"),
    email: z.email("不正なメールアドレスです"),
});
type formInput = z.infer<typeof formSchema>;

export const Login = () => {
    const router = useRouter();

    const login = async (formData: formInput) => {
        const userId = formData.userId;
        const email = formData.email;
        const uuid = localStorage.getItem("token");

        // TODO: JSONサーバからバックエンドAPIに置き換えること
        const res = await fetch("http://localhost:3030/users");
        const data: LoginInfo[] = await res.json();

        const isCreated = data.some(
            (user) => user.userId === userId && user.email === email && user.token === uuid
        );
        if (isCreated) {
            router.push("/dashboard");
        } else {
            // TODO: グローバルエラーをToastで表示するようにすること
        }
    };

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
    } = useForm<formInput>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
    });

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ mt: "40%", padding: "70px", maxHeight: "320px" }}>
                <Typography variant="h1" fontSize={"42px"} textAlign="center" paddingBottom={5}>
                    Copy Slack
                </Typography>

                <form onSubmit={handleSubmit(login)}>
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
                            type="email"
                            id="email"
                            label="メールアドレス"
                            {...register("email")}
                            helperText={errors.email?.message}
                            error={errors.email != null}
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
