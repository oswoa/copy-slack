import { s3Client } from "@/app/lib/init";
import { ISaveImage } from "./ISaveImage";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export class S3 implements ISaveImage {
    async storeImage(file: File, uploadPath: string): Promise<void> {
        try {
            const arrayBuffer = await file!.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const command = new PutObjectCommand({
                Bucket: uploadPath,
                Key: file.name,
                Body: buffer,
            });
            await s3Client.send(command);
        } catch (error) {
            throw new Error("Error uploading image to S3:" + error);
        }
    }
}
