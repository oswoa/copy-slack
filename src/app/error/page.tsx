"use client";

import { Container, Link, Paper, Typography } from "@mui/material";
import { PageFactory } from "../constants/pageUrl";

export const Error = () => {
    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ mt: "40%", padding: "70px", maxHeight: "400px" }}>
                <Typography variant="h1" fontSize={"42px"} textAlign="center" paddingBottom={5}>
                    不明なエラーが発生しました
                </Typography>

                <Typography fontSize={"16px"} textAlign="center" marginTop={3}>
                    <Link href={PageFactory.GetLoginURL()}>ログイン画面</Link>へ戻る
                </Typography>
            </Paper>
        </Container>
    );
};

export default Error;
