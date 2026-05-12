import { ISaveImage } from "./ISaveImage";

export class S3 implements ISaveImage {
    async storeImage(file: File, uploadPath: string): Promise<void> {
        throw new Error("not implemented");
    }
}
