import { CurrentUserProvider } from "@/app/context/CurrentUserContext";
import { UserWorkspacesProvider } from "@/app/context/UserWorkspacesContext";

import "@/app/page.module.css";
import "./page.module.css";

export default function WorkspaceComponentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <CurrentUserProvider>
            <UserWorkspacesProvider>{children}</UserWorkspacesProvider>
        </CurrentUserProvider>
    );
}
