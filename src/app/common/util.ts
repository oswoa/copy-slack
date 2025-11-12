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
    args?: S
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

/**
    指定した形式でDateオブジェクトを文字列で返す
    hour: 0埋め2桁表示
    minute: 0埋め2桁表示
*/
export const jstTimeString = (date: Date) => {
    return date.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
    });
};
