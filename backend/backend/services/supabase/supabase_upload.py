"""
Supabase Service
- Upload PDFs to Supabase Storage
- Optionally register a record in 'legal_documents' table (if present)
Env:
  SUPABASE_API_URL (preferred) or SUPABASE_URL -> https://<ref>.supabase.co
  SUPABASE_SERVICE_ROLE_KEY (preferred) or SUPABASE_ANON_KEY
  SUPABASE_BUCKET (default: 'legal-docs')
"""

from __future__ import annotations

import os
import logging
import base64
import json
from typing import Optional, Dict, Any
from uuid import uuid4

try:
    from supabase import create_client, Client  # type: ignore
    _SUPABASE_AVAILABLE = True
    _SUPABASE_IMPORT_ERROR: Optional[Exception] = None
except Exception as _e:  # pragma: no cover - only triggers if package missing
    Client = None  # type: ignore
    _SUPABASE_AVAILABLE = False
    _SUPABASE_IMPORT_ERROR = _e

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self) -> None:
        if not _SUPABASE_AVAILABLE:
            raise RuntimeError(f"Supabase SDK not available: {_SUPABASE_IMPORT_ERROR}")

        # Prefer explicit API URL; accept legacy SUPABASE_URL
        self.url = os.getenv("SUPABASE_API_URL") or os.getenv("SUPABASE_URL")
        # Prefer service role key on server-side
        self.key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
        if not self.key:
            raise RuntimeError("Missing Supabase credentials. Set SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY).")

        # If URL is missing or appears to be a Postgres connection string, try to derive API URL from key's 'ref'
        if not self.url or (self.url or "").startswith("postgres://") or (self.url or "").startswith("postgresql://"):
            derived = self._construct_api_url_from_key(self.key)
            if derived:
                self.url = derived
                logger.info("Derived SUPABASE API URL from key 'ref'.")
            else:
                example = "https://YOUR-PROJECT-REF.supabase.co"
                current = self.url or "<empty>"
                raise RuntimeError(
                    "Invalid Supabase URL. Expected the project API URL (e.g., "
                    f"{example}), got '{current}'. Set SUPABASE_API_URL or SUPABASE_URL to the API URL."
                )

        if not (self.url.startswith("http://") or self.url.startswith("https://")):
            raise RuntimeError(
                f"Invalid Supabase URL '{self.url}'. It must start with http(s) and look like https://<ref>.supabase.co"
            )

        self.bucket = os.getenv("SUPABASE_BUCKET", "legal-docs")

        try:
            self.client: Client = create_client(self.url, self.key)  # type: ignore[assignment]
        except Exception as e:  # pragma: no cover
            raise RuntimeError(f"Failed to create Supabase client with URL '{self.url}': {e}")

    @staticmethod
    def _construct_api_url_from_key(key: str) -> Optional[str]:
        """Attempt to construct https://<ref>.supabase.co from a service role or anon key."""
        try:
            parts = key.split(".")
            if len(parts) < 2:
                return None
            payload_b64 = parts[1]
            # Pad base64 if necessary
            missing = len(payload_b64) % 4
            if missing:
                payload_b64 += "=" * (4 - missing)
            payload_json = base64.urlsafe_b64decode(payload_b64.encode("utf-8")).decode("utf-8")
            payload = json.loads(payload_json)
            ref = payload.get("ref")
            if ref:
                return f"https://{ref}.supabase.co"
        except Exception:
            return None
        return None

    def upload_and_register_document(
        self,
        file_path: str,
        original_filename: str,
        document_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Upload a file to Supabase Storage and optionally register a row in 'legal_documents'.
        Returns dict: { success, document_id, storage_bucket, storage_key, public_url }
        """
        doc_id = document_id or str(uuid4())
        _, ext = os.path.splitext(original_filename or "")
        ext = ext or ".pdf"
        storage_key = f"{doc_id}{ext}"

        # Upload file (upsert)
        try:
            self.client.storage.from_(self.bucket).upload(
                path=storage_key,
                file=file_path,
                file_options={"content-type": "application/pdf", "upsert": True},
            )
        except Exception as e:
            # If already exists and upsert not honored by backend, try update
            logger.warning(f"Upload attempt failed, retrying with update: {e}")
            self.client.storage.from_(self.bucket).update(
                path=storage_key,
                file=file_path,
                file_options={"content-type": "application/pdf"},
            )

        # Get public URL if bucket is public
        public_url: Optional[str] = None
        try:
            res = self.client.storage.from_(self.bucket).get_public_url(storage_key)
            if isinstance(res, dict):
                public_url = res.get("data", {}).get("publicUrl") or res.get("publicUrl")
            else:
                public_url = getattr(res, "public_url", None) or str(res)
        except Exception as e:
            logger.info(f"Public URL not available (bucket likely private): {e}")

        # Optional DB record
        try:
            row = {
                "id": doc_id,
                "file_name": original_filename,
                "storage_bucket": self.bucket,
                "storage_key": storage_key,
                "public_url": public_url,
            }
            self.client.table("legal_documents").upsert(row, on_conflict="id").execute()
        except Exception as e:
            logger.info(f"Skipping 'legal_documents' upsert: {e}")

        return {
            "success": True,
            "document_id": doc_id,
            "storage_bucket": self.bucket,
            "storage_key": storage_key,
            "public_url": public_url,
        }

# Global instance
_supabase_service: Optional[SupabaseService] = None

def get_supabase_service() -> SupabaseService:
    global _supabase_service
    if _supabase_service is None:
        _supabase_service = SupabaseService()
    return _supabase_service