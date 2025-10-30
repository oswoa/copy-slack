"use client";

import Link from "next/link";

import WorkspaceSwitcher from "@/app/(auth)/workspace/[workspaceId]/components/WorkspaceSwitcher";
import { Stack } from "@mui/material";

import "./page.modules.css";

const Workspace = () => {
    return (
        <>
            <Stack direction={"row"}>
                <nav>
                    <WorkspaceSwitcher />
                </nav>
                <main>main</main>
            </Stack>

            <Link href={"/sample"}>Sampleへ遷移</Link>
        </>
    );
};

export default Workspace;
