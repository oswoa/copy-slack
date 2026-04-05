export class Post {
    constructor(
        readonly postId: string,
        readonly channelId: string,
        readonly userId: string,
        readonly content: string,
        readonly createdAt: Date,
        readonly updatedAt: Date,
        readonly displayName: string,
        readonly imgUrl: string,
    ) {}

    getCreatedAtJstDate(): string {
        return this.getJstDate(this.createdAt);
    }

    getCreatedAtJstTime(): string {
        return this.getJstTime(this.createdAt);
    }

    getUpdatedAtJstDate() {
        return this.getJstDate(this.updatedAt);
    }

    getUpdatedAtJstTime() {
        return this.getJstTime(this.updatedAt);
    }

    /**
        指定した形式でDateオブジェクトを文字列で返す
        year: 西暦
        month: 0埋め2桁表示
        day: 0埋め2桁表示
    */
    private getJstDate(date: Date): string {
        return date.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: "Asia/Tokyo",
        });
    }

    /**
        指定した形式でDateオブジェクトを文字列で返す
        hour: 0埋め2桁表示
        minute: 0埋め2桁表示
    */
    private getJstTime(date: Date): string {
        return date.toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Tokyo",
        });
    }
}
