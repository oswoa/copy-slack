#!/bin/sh

echo 'Waiting for MinIO to start...'
sleep 5
mc alias set minio http://minio:${MINIO_CONSOLE_PORT} ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}

echo 'Creating bucket if not exists...'
mc mb minio/${S3_BUCKET_NAME} > /dev/null 2>&1 || true

echo 'Setting bucket policy...'
mc anonymous set public minio/${S3_BUCKET_NAME}