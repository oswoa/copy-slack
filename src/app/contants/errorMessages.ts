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

    // サーバエラー
    ERROR_SERVER_UNKNOWN: () => "サーバで不明なエラーが発生しました",
    ERROR_SERVER_USER_UNAUTHORIZED: () => "ユーザIDもしくはパスワードが間違っています",
    ERROR_SERVER_NOT_FOUND_USER_WORKSPACE: () => "ユーザのワークスペースが存在しません",
    ERROR_SERVER_WORKSPACES_DOESNT_EXIST: () => "サーバにワークスペースが存在しません",
    ERROR_SERVER_CHAT_HISTORY_DOESNT_EXIST: () => "サーバにチャット履歴が存在しません",
    ERROR_SERVER_FAILED_REGISTER_USER: () => "ユーザの登録に失敗しました",
    ERROR_SERVER_FAILED_REGISTER_WORKSPACE: () => "ワークスペースの登録に失敗しました",
    ERROR_SERVER_FAILED_REGISTER_CHAT: () => "チャットの登録に失敗しました",
} as const;
