export const LOCAL_STORE_PATH = "uploads/users";
export const LOCAL_UPLOAD_PATH = `${process.cwd()}/public/${LOCAL_STORE_PATH}`;

export const PROFILE_IMAGE_UPLOAD_PATH =
    process.env.STORAGE_TYPE === "local" ? LOCAL_UPLOAD_PATH : process.env.S3_BUCKET_NAME;
export const PROFILE_IMAGE_STORE_PATH =
    process.env.STORAGE_TYPE === "local" ? `/${LOCAL_STORE_PATH}` : process.env.S3_BUCKET_NAME;
