export const ERROR_MESSAGES = {
    // クライアントエラー
    ERROR_CLIENT_UNKNOWN: "不明なエラーが発生しました",
    ERROR_CLIENT_DELETED_CURRENT_CHANNEL_BY_WORKSPACE_OWNER:
        "このチャンネルはワークスペース所有者によって削除されました",
    ERROR_CLIENT_DELETED_CURRENT_WORKSPACE_BY_WORKSPACE_OWNER:
        "このワークスペースは所有者によって削除されました",
    ERROR_CLIENT_VALIDATION_USER_ID_MIN_LENGTH: (length: number) =>
        `ユーザIDは${length}文字以上で入力してください`,
    ERROR_CLIENT_VALIDATION_USER_ID_MAX_LENGTH: (length: number) =>
        `ユーザIDは${length}文字以内で入力してください`,
    ERROR_CLIENT_VALIDATION_USER_ID_ALREADY_USED: "ユーザIDは既に使われています",
    ERROR_CLIENT_VALIDATION_PASSWROD_MIN_LENGTH: (length: number) =>
        `パスワードは${length}文字以上で入力してください`,
    ERROR_CLIENT_VALIDATION_PASSWORD_MAX_LENGTH: (length: number) =>
        `パスワードは${length}文字以内で入力してください`,
    ERROR_CLIENT_VALIDATION_INCORRECT_PASSWORD: "ユーザIDもしくはパスワードが間違っています",
    ERROR_CLIENT_VALIDATION_INCORRECT_EMAIL: "不正なメールアドレスです",
    ERROR_CLIENT_VALIDATION_COMMON_TEXT_MIN_LENGTH: (length: number) =>
        `${length}文字以上で入力してください`,
    ERROR_CLIENT_VALIDATION_COMMON_TEXT_MAX_LENGTH: (length: number) =>
        `${length}文字以内で入力してください`,

    // サーバエラー
    ERROR_SERVER_UNKNOWN: "サーバで不明なエラーが発生しました",
    ERROR_SERVER_FAILED_CONNECT_DB: "データベースの接続に失敗しました",
    ERROR_SERVER_DB_CONNECTION_TIMEOUT: "データベースがタイムアウトしました",
    ERROR_SERVER_USER_UNAUTHORIZED: "ユーザの認証に失敗しました",
    ERROR_SERVER_VALIDATION: "パラメータが不正です",

    ERROR_SERVER_FAILED_GET_RECORDS: "データの検索に失敗しました",
    ERROR_SERVER_NOT_FOUND_RECORDS: "データが見つかりませんでした",

    ERROR_SERVER_FAILED_REGISTER_RECORDS: "データの登録に失敗しました",
    ERROR_SERVER_ALREADY_REGISTERED_RECORDS: "既に登録されています",
} as const;
