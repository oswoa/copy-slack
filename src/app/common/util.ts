export const Logger = {
    info: (msg: string) => {
        const output = `[INFO]: ${msg}`;
        console.info(output);
        return output;
    },

    warn: (msg: string) => {
        const output = `[WARN]: ${msg}`;
        console.warn(output);
        return output;
    },

    error: (msg: string) => {
        const output = `[ERROR]: ${msg}`;
        console.error(output);
        return output;
    },
};

// TODO: fetchをこっちに置き換える
/**
 * fetchのラッパー関数
 * @param method HTTPメソッドを指定
 * @param url エンドポイント
 * @param args APIが要求する引数
 * @returns APIレスポンス
 */
export const fetchApi = async <S, T>(
    method: "GET" | "POST" | "DELETE" | "PATCH",
    url: string,
    args?: S,
): Promise<T> => {
    let data: T = {} as T;

    if (method === "GET") {
        const res = await fetch(url);
        data = await res.json();
    } else if (args !== undefined) {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...args }),
        });
        data = await res.json();
    }

    return data;
};
