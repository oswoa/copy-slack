import { BASE_URL } from "@/app/contants/api";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { HttpStatusCode } from "axios";

export async function POST(request: Request) {
    let status: HttpStatusCode = HttpStatusCode.Ok;

    try {
        const formData = await request.json();
        await fetch(`${BASE_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
    } catch (_) {
        status = HttpStatusCode.InternalServerError;
        console.error(ERROR_MESSAGES.ERROR_UNKNOWN());
    } finally {
        return Response.json({ status });
    }
}
