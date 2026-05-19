import json
import os
import sqlite3
import tempfile
from dataclasses import dataclass, field
from typing import List


REQUIRED_TABLES = {"adf_meta", "adf_config", "adf_files"}


class ADFValidationError(Exception):
    pass


@dataclass
class ADFData:
    name: str
    document_md: str
    tools: List[str] = field(default_factory=list)


def parse_adf(file_bytes: bytes) -> ADFData:
    """
    Validate file_bytes as a conformant .adf SQLite database and extract
    agent name, document_md, and tools list.
    Raises ADFValidationError if the file is not a valid .adf file.
    """
    with tempfile.NamedTemporaryFile(suffix=".adf", delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        try:
            conn = sqlite3.connect(tmp_path)
        except sqlite3.DatabaseError as exc:
            raise ADFValidationError(f"File is not a valid SQLite database: {exc}")

        try:
            cur = conn.cursor()
            cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
            existing = {row[0] for row in cur.fetchall()}
            missing = REQUIRED_TABLES - existing
            if missing:
                raise ADFValidationError(
                    f"Not a valid .adf file — missing required tables: {', '.join(sorted(missing))}"
                )

            cur.execute("SELECT config_json FROM adf_config LIMIT 1")
            row = cur.fetchone()
            config: dict = {}
            if row and row[0]:
                try:
                    config = json.loads(row[0])
                except json.JSONDecodeError:
                    pass

            name: str = config.get("name") or config.get("agent_name") or "Unnamed Agent"

            tools_raw = config.get("tools") or config.get("enabled_tools") or []
            tools: List[str] = []
            if isinstance(tools_raw, list):
                for t in tools_raw:
                    if isinstance(t, dict):
                        tool_name = t.get("name")
                        if tool_name:
                            tools.append(str(tool_name))
                    elif t:
                        tools.append(str(t))

            cur.execute(
                "SELECT content FROM adf_files WHERE path = 'document.md' LIMIT 1"
            )
            doc_row = cur.fetchone()
            raw = doc_row[0] if doc_row and doc_row[0] else ""
            document_md: str = raw.decode("utf-8") if isinstance(raw, (bytes, bytearray)) else str(raw)

            return ADFData(name=name, document_md=document_md, tools=tools)
        finally:
            conn.close()
    finally:
        os.unlink(tmp_path)
