import { User } from "@/app/common/User";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { HttpStatusCode } from "axios";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    let status: HttpStatusCode = HttpStatusCode.Ok;
    let user: User | undefined;

    try {
        const { id } = await params;
        const res = await fetch(`${BASE_URL}/users/${id}`);

        switch (res.status) {
            case HttpStatusCode.Ok:
                const data: User = await res.json();
                user = new User(data.id, data.token);
                break;

            case HttpStatusCode.NotFound:
                break;
        }
    } catch (_) {
        status = HttpStatusCode.InternalServerError;
        console.error(ERROR_MESSAGES.ERROR_UNKNOWN());
    } finally {
        return Response.json({ user }, { status });
    }
}
