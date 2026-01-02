"use client";

import { Container, Link, Paper, Typography } from "@mui/material";

export const NotFound = () => {
    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ mt: "40%", padding: "70px", maxHeight: "400px" }}>
                <Typography variant="h1" fontSize={"42px"} textAlign="center" paddingBottom={5}>
                    ページが見つかりませんでした
                </Typography>

                <Typography fontSize={"16px"} textAlign="center" marginTop={3}>
                    <Link href="/login">ログイン画面</Link>へ戻る
                </Typography>
            </Paper>
        </Container>
    );
};

export default NotFound;
