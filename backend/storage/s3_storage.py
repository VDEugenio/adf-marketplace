import boto3
from storage.base import StorageBackend


class S3StorageBackend(StorageBackend):
    """Stores files in AWS S3."""

    def __init__(self, bucket: str, region: str, access_key: str, secret_key: str):
        self.bucket = bucket
        self.client = boto3.client(
            "s3",
            region_name=region,
            # Pass None so boto3 falls back to IAM role / env vars / ~/.aws/credentials
            aws_access_key_id=access_key or None,
            aws_secret_access_key=secret_key or None,
        )

    def upload_file(self, file_bytes: bytes, destination_path: str) -> str:
        self.client.put_object(
            Bucket=self.bucket,
            Key=destination_path,
            Body=file_bytes,
        )
        return destination_path

    def get_url(self, storage_key: str, expiry_seconds: int = 3600) -> str:
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": storage_key},
            ExpiresIn=expiry_seconds,
        )
