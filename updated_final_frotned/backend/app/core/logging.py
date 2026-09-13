import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any, Dict


class JSONFormatter(logging.Formatter):
    """
    Structured JSON log formatter for enterprise observability.
    Outputs ISO8601 timestamps, log level, logger name, message,
    and optional context fields (request_id, user_id, latency_ms).
    """

    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Include contextual attributes if present
        for key in ("request_id", "correlation_id", "user_id", "path", "method", "status_code", "latency_ms"):
            val = getattr(record, key, None)
            if val is not None:
                log_obj[key] = val

        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_obj)


def setup_logging(level: str = "INFO") -> None:
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Clear existing handlers
    root_logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    root_logger.addHandler(handler)

    # Quiet external noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)


logger = logging.getLogger("bhoomi_setu")
