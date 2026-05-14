import { writeFile } from "fs/promises";
import { ISaveImage } from "./ISaveImage";

export class LocalStorage implements ISaveImage {
    async storeImage(file: File, uploadPath: string): Promise<void> {
        const arrayBuffer = await file!.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(`${uploadPath}/${file.name}`, buffer);
    }
}
