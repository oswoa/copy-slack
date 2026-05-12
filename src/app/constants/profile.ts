export const LOCAL_STORE_PATH = "uploads/users";
export const LOCAL_UPLOAD_PATH = `${process.cwd()}/public/${LOCAL_STORE_PATH}`;
export const S3_UPLOAD_PATH = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}`;

export const PROFILE_IMAGE_UPLOAD_PATH =
    process.env.NODE_ENV === "development" ? LOCAL_UPLOAD_PATH : S3_UPLOAD_PATH;
export const PROFILE_IMAGE_STORE_PATH =
    process.env.NODE_ENV === "development" ? `/${LOCAL_STORE_PATH}` : S3_UPLOAD_PATH;
