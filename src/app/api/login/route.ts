import { User } from "@/app/common/User";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { HttpStatusCode } from "axios";

type UserResponse = {
    id: string;
    password: string;
    token: string;
};

export async function POST(request: Request) {
    let user: User | undefined;
    let status: HttpStatusCode = HttpStatusCode.Unauthorized;

    try {
        const { id, password, token } = await request.json();
        const res = await fetch(`${BASE_URL}/users/${id}`);

        switch (res.status) {
            case HttpStatusCode.Ok:
                const data: UserResponse = await res.json();
                if (data.id === id && data.password === password && data.token === token) {
                    user = new User(data.id, data.token);
                    status = HttpStatusCode.Ok;
                }
                break;

            case HttpStatusCode.NotFound:
                // ユーザがいない事を気づかせないため、401で返す
                break;
        }
    } catch (_) {
        status = HttpStatusCode.InternalServerError;
        console.error(ERROR_MESSAGES.ERROR_UNKNOWN());
    } finally {
        return Response.json({ user }, { status });
    }
}
