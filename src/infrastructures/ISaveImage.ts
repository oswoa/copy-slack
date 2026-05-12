export interface ISaveImage {
    storeImage(file: File, uploadPath: string): Promise<void>;
}
