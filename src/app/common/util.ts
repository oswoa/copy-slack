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
