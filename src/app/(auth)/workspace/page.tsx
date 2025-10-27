"use client";

import { useCurrentUser } from "@/app/context/CurrentUserContext";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import React from "react";

const Workspace = () => {
    const router = useRouter();
    const currentUser = useCurrentUser();

    const onClick = () => {
        router.push("/sample");
    };

    // TODO: 画面をリロードするとcontextのstateが初期化されてしまうため、解決方法を探す
    return (
        <div>
            workspace
            <div>id: {currentUser?.id}</div>
            <div>email: {currentUser?.email}</div>
            <div>token: {currentUser?.token}</div>
            <Button variant="contained" onClick={onClick}>
                Sampleへ遷移
            </Button>
        </div>
    );
};

export default Workspace;
