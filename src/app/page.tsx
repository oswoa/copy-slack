"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import "./page.module.css";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.push("/login");
    }, []);

    return <>home</>;
}
