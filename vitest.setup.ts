import "@testing-library/jest-dom/vitest";
import { afterAll, beforeAll, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "@/tests/node";

export const mockReplace = vi.fn();
export const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        replace: mockReplace,
        push: mockPush,
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
