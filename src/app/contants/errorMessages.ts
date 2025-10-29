export const ERROR_MESSAGES = {
    // クライアントエラー
    ERROR_CLIENT_UNKNOWN: () => "不明なエラーが発生しました",
    ERROR_VALIDATION_USER_ID_MIN_LENGTH: (length: number) =>
        `ユーザIDは${length}文字以上で入力してください`,
    ERROR_VALIDATION_USER_ID_MAX_LENGTH: (length: number) =>
        `ユーザIDは${length}文字以内で入力してください`,
    ERROR_VALIDATION_USER_ID_ALREADY_USED: () => "ユーザIDは既に使われています",
    ERROR_VALIDATION_PASSWROD_MIN_LENGTH: (length: number) =>
        `パスワードは${length}文字以上で入力してください`,
    ERROR_VALIDATION_PASSWORD_MAX_LENGTH: (length: number) =>
        `パスワードは${length}文字以内で入力してください`,
    ERROR_VALIDATION_INCORRECT_EMAIL: () => "不正なメールアドレスです",
    ERROR_CLIENT_WORKSPACE_DOESNT_EXIST: () => "ユーザのワークスペースが存在しません",

    // サーバエラー
    ERROR_SERVER_UNKNOWN: () => "サーバで不明なエラーが発生しました",
    ERROR_SERVER_USER_UNAUTHORIZED: () => "ユーザIDもしくはパスワードが間違っています",
    ERROR_SERVER_WORKSPACES_DOESNT_EXIST: () => "サーバにワークスペースが存在しません",
} as const;
