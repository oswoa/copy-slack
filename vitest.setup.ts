import "@testing-library/jest-dom/vitest";
import { afterAll, beforeAll, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "@/tests/node";

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        replace: vi.fn(),
        push: vi.fn(),
    }),
}));

beforeAll(() => {
    server.listen();
});

afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
    cleanup();
});

afterAll(() => {
    server.close();
});
