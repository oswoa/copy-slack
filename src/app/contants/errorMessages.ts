export const ERROR_MESSAGES = {
    // クライアントエラー
    ERROR_CLIENT_UNKNOWN: () => "不明なエラーが発生しました",

    ERROR_CLIENT_VALIDATION_USER_ID_MIN_LENGTH: (length: number) =>
        `ユーザIDは${length}文字以上で入力してください`,
    ERROR_CLIENT_VALIDATION_USER_ID_MAX_LENGTH: (length: number) =>
        `ユーザIDは${length}文字以内で入力してください`,
    ERROR_CLIENT_VALIDATION_USER_ID_ALREADY_USED: () => "ユーザIDは既に使われています",
    ERROR_CLIENT_VALIDATION_PASSWROD_MIN_LENGTH: (length: number) =>
        `パスワードは${length}文字以上で入力してください`,
    ERROR_CLIENT_VALIDATION_PASSWORD_MAX_LENGTH: (length: number) =>
        `パスワードは${length}文字以内で入力してください`,
    ERROR_CLIENT_VALIDATION_INCORRECT_EMAIL: () => "不正なメールアドレスです",

    // サーバエラー
    ERROR_SERVER_UNKNOWN: () => "サーバで不明なエラーが発生しました",
    ERROR_SERVER_USER_UNAUTHORIZED: () => "ユーザIDもしくはパスワードが間違っています",

    ERROR_SERVER_FAILED_GET_USERS: () => "ユーザの取得に失敗しました",
    ERROR_SERVER_FAILED_GET_CHAT_HISTORY: () => "チャット履歴の取得に失敗しました",
    ERROR_SERVER_FAILED_GET_WORKSPACES: () => "ワークスペースの取得に失敗しました",

    ERROR_SERVER_FAILED_REGISTER_USER: () => "ユーザの登録に失敗しました",
    ERROR_SERVER_FAILED_REGISTER_WORKSPACE: () => "ワークスペースの登録に失敗しました",
    ERROR_SERVER_FAILED_REGISTER_CHAT: () => "チャットの登録に失敗しました",

    ERROR_SERVER_DOESNT_EXIST_USER: () => "サーバにユーザが存在しません",
    ERROR_SERVER_DOESNT_EXIST_WORKSPACES: () => "サーバにワークスペースが存在しません",
    ERROR_SERVER_DOESNT_EXIST_USER_WORKSPACE: () => "ユーザのワークスペースが存在しません",
    ERROR_SERVER_DOESNT_EXIST_CHAT_HISTORY: () => "サーバにチャット履歴が存在しません",
} as const;
