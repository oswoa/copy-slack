"use client";

import { useLoginUser } from "@/app/context/CurrentUserContext";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import React from "react";

const Sample = () => {
    const router = useRouter();
    const { loginUser } = useLoginUser();
    console.log(loginUser);

    const onClick = () => {
        router.push("/workspace");
    };

    return (
        <div>
            sample
            <div>id: {loginUser?.id}</div>
            <div>email: {loginUser?.email}</div>
            <div>token: {loginUser?.token}</div>
            <Button variant="contained" onClick={onClick}>
                Workspaceへ遷移
            </Button>
        </div>
    );
};

export default Sample;
