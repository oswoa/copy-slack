"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageFactory } from "./constants/pageUrl";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.push(PageFactory.GetLoginURL());
    }, []);

    return;
}
