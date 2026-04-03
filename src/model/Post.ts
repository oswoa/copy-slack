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
}
