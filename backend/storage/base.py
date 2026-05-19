from abc import ABC, abstractmethod


class StorageBackend(ABC):
    """Minimal interface that all storage backends must implement."""

    @abstractmethod
    def upload_file(self, file_bytes: bytes, destination_path: str) -> str:
        """
        Persist file_bytes at destination_path.
        Returns the storage key used to retrieve the file later.
        """

    @abstractmethod
    def get_url(self, storage_key: str) -> str:
        """
        Return a URL or local file path for accessing the stored file.
        S3 backend returns a presigned URL; local backend returns an absolute path.
        """
