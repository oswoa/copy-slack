export class Post {
    constructor(
        readonly postId: number,
        readonly channelId: number,
        readonly userId: string,
        readonly content: string,
        readonly createdAt: Date,
        readonly updatedAt: Date,
        readonly displayName: string,
        readonly imgUrl: string,
    ) {}
}
