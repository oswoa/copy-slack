export const LOCAL_STORE_PATH = "uploads/users";
export const LOCAL_UPLOAD_PATH = `${process.cwd()}/public/${LOCAL_STORE_PATH}`;

export const PROFILE_IMAGE_UPLOAD_PATH =
    process.env.STORAGE_TYPE === "s3" ? process.env.S3_BUCKET_NAME : LOCAL_UPLOAD_PATH;
export const PROFILE_IMAGE_STORE_PATH =
    process.env.STORAGE_TYPE === "s3"
        ? `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}`
        : `/${LOCAL_STORE_PATH}`;
