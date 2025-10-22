"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { uuidv7 } from "uuidv7";

import { Container, Paper, Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";

import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

// バリデーションスキーマ
const formSchema = z.object({
    id: z
        .string()
        .min(3, ERROR_MESSAGES.ERROR_VALIDATION_USER_ID_MIN_LENGTH(3))
        .max(20, ERROR_MESSAGES.ERROR_VALIDATION_USER_ID_MAX_LENGTH(20))
        //* refineは他プロパティのバリデーションが走る時も動いてしまうが、制約とする
        .refine(
            async (id) => {
                if (id === "") {
                    return true;
                }
                // ユーザ照会
                const res = await fetch(`/api/users/${id}`);
                const { user } = await res.json();
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

    const signup = async (formData: formInput) => {
        try {
            // ユーザ登録
            const token = uuidv7();
            await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, token }),
            });

            localStorage.setItem("token", token);
            router.push("/dashboard");
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
        mode: "onBlur",
        defaultValues: {
            id: "",
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
                            {...register("email")}
                            helperText={errors.email?.message}
                            error={errors.email != null}
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
                            登録
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
};

export default Signup;
