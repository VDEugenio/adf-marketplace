from storage.base import StorageBackend
from storage.local_storage import LocalStorageBackend
from storage.s3_storage import S3StorageBackend
from config import settings


def get_storage_backend() -> StorageBackend:
    if settings.storage_backend == "s3":
        return S3StorageBackend(
            bucket=settings.aws_s3_bucket_name,
            region=settings.aws_s3_region,
            access_key=settings.aws_access_key_id,
            secret_key=settings.aws_secret_access_key,
        )
    return LocalStorageBackend(base_path=settings.local_storage_path)


storage = get_storage_backend()
