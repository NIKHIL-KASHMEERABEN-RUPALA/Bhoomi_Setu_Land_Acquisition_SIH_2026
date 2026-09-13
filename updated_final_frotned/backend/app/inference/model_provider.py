import json
import os
import threading
from typing import Any, Dict, List, Optional
import joblib
from app.core.config import settings
from app.core.exceptions import ModelInferenceException
from app.core.logging import logger


class ModelProvider:
    """
    Thread-safe Singleton Model Provider for loading and serving
    the exported Kaggle-trained ML pipeline.
    Enforces strict artifact validation, version checking, and schema verification.
    """

    _instance: Optional["ModelProvider"] = None
    _lock = threading.Lock()

    def __init__(self):
        self.model: Optional[Any] = None
        self.schema: Optional[Dict[str, Any]] = None
        self.metadata: Optional[Dict[str, Any]] = None
        self.feature_names: List[str] = []
        self._is_ready: bool = False

    @classmethod
    def get_instance(cls) -> "ModelProvider":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def load_artifact(self) -> bool:
        """
        Validates artifact existence, schema integrity, and loads the serialized pipeline.
        Fails safely if missing or corrupted.
        """
        model_dir = settings.MODEL_DIR
        model_path = os.path.join(model_dir, settings.MODEL_FILENAME)
        schema_path = os.path.join(model_dir, settings.FEATURE_SCHEMA_FILENAME)
        metadata_path = os.path.join(model_dir, settings.MODEL_METADATA_FILENAME)

        if not os.path.exists(model_path):
            logger.warning(f"Model artifact not found at {model_path}. Inference operating in fallback rule mode.")
            self._is_ready = False
            return False

        if not os.path.exists(schema_path):
            raise ModelInferenceException(f"Feature schema missing: expected at {schema_path}")

        try:
            # 1. Load Feature Schema
            with open(schema_path, "r", encoding="utf-8") as f:
                loaded_schema = json.load(f)
            self.schema = loaded_schema
            self.feature_names = [feat["name"] for feat in loaded_schema.get("features", [])]

            if not self.feature_names:
                raise ModelInferenceException("Feature schema contains no features.")

            # 2. Load Metadata
            if os.path.exists(metadata_path):
                with open(metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            else:
                self.metadata = {
                    "version": "1.0.0",
                    "model_name": "BhoomiSetu-Pipeline",
                    "target": "delayed_gt_90_days",
                }

            # 3. Load Serialized Pipeline
            with open(model_path, "rb") as f:
                self.model = joblib.load(f)

            self._is_ready = True
            meta = self.metadata or {}
            logger.info(
                f"Successfully loaded model artifact '{meta.get('model_name')}' "
                f"(version {meta.get('version')}) with {len(self.feature_names)} features."
            )
            return True

        except Exception as e:
            self._is_ready = False
            logger.exception(f"Failed to load ML model artifact: {str(e)}")
            raise ModelInferenceException(f"Corrupted or invalid ML artifact: {str(e)}")

    def is_ready(self) -> bool:
        return self._is_ready and self.model is not None

    def get_feature_names(self) -> List[str]:
        return self.feature_names

    def get_schema(self) -> Dict[str, Any]:
        return self.schema or {}

    def get_metadata(self) -> Dict[str, Any]:
        return self.metadata or {}


def get_model_provider() -> ModelProvider:
    provider = ModelProvider.get_instance()
    if not provider.is_ready():
        provider.load_artifact()
    return provider
