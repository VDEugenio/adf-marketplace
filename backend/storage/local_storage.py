import os
from storage.base import StorageBackend


class LocalStorageBackend(StorageBackend):
    """Stores files on the local filesystem. Intended for development only."""

    def __init__(self, base_path: str = "./uploads"):
        self.base_path = base_path
        os.makedirs(base_path, exist_ok=True)

    def upload_file(self, file_bytes: bytes, destination_path: str) -> str:
        full_path = os.path.join(self.base_path, destination_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "wb") as f:
            f.write(file_bytes)
        return destination_path

    def get_url(self, storage_key: str) -> str:
        return os.path.abspath(os.path.join(self.base_path, storage_key))
